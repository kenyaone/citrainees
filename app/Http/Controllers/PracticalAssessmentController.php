<?php

namespace App\Http\Controllers;

use App\Models\Skill;
use App\Models\SkillAssessment;
use App\Models\SkillAssessmentAttempt;
use App\Services\PracticalTaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PracticalAssessmentController extends Controller
{
    private const COOLDOWN_DAYS = 7;
    private const TIME_LIMIT_MINUTES = 15;
    private const MAX_LIFETIME_ATTEMPTS = 3;

    public function __construct(private readonly PracticalTaskService $tasks) {}

    public function start(Skill $skill, Request $request): RedirectResponse
    {
        $alumni = $request->user()->alumniProfile;

        abort_unless(
            $alumni->skills->contains($skill->id),
            403,
            'Add this skill to your profile before starting a practical assessment.',
        );

        $assessment = SkillAssessment::firstOrCreate(
            ['skill_id' => $skill->id, 'type' => 'practical'],
            [
                'title' => "Practical: {$skill->name}",
                'description' => 'AI-generated practical task with human review.',
                'pass_threshold' => 70,
                'time_limit_minutes' => self::TIME_LIMIT_MINUTES,
                'is_active' => true,
            ],
        );

        $existing = SkillAssessmentAttempt::where('alumni_id', $alumni->id)
            ->where('skill_assessment_id', $assessment->id)
            ->whereNull('submitted_at')
            ->whereNull('voided_at')
            ->first();

        if ($existing) {
            return redirect()->route('practical.take', $existing);
        }

        $priorAttempts = SkillAssessmentAttempt::where('alumni_id', $alumni->id)
            ->where('skill_assessment_id', $assessment->id)
            ->count();

        if ($priorAttempts >= self::MAX_LIFETIME_ATTEMPTS) {
            return redirect()->route('assessments.index')
                ->with('error', 'You have used all '.self::MAX_LIFETIME_ATTEMPTS.' attempts for this practical task. Ask staff to review your submissions.');
        }

        $latest = SkillAssessmentAttempt::where('alumni_id', $alumni->id)
            ->where('skill_assessment_id', $assessment->id)
            ->latest('created_at')
            ->first();

        if ($latest && ! $latest->passed && $latest->submitted_at) {
            $unlockAt = $latest->submitted_at->copy()->addDays(self::COOLDOWN_DAYS);
            if ($unlockAt->isFuture()) {
                return redirect()->route('assessments.index')
                    ->with('error', 'You can retry this task on '.$unlockAt->toFormattedDateString().'.');
            }
        }

        try {
            $task = $this->tasks->generate($skill);
        } catch (\Throwable $e) {
            return redirect()->route('assessments.index')
                ->with('error', 'Could not generate a task right now. Try again in a minute. ('.$e->getMessage().')');
        }

        $attempt = SkillAssessmentAttempt::create([
            'alumni_id' => $alumni->id,
            'skill_assessment_id' => $assessment->id,
            'started_at' => now(),
            'task_prompt' => $task['task_prompt'],
            'task_rubric' => array_merge($task['rubric'], [['follow_up_question' => $task['follow_up_question']]]),
        ]);

        return redirect()->route('practical.take', $attempt);
    }

    public function take(SkillAssessmentAttempt $attempt, Request $request): Response|RedirectResponse
    {
        $alumni = $request->user()->alumniProfile;
        abort_unless($attempt->alumni_id === $alumni->id, 404);

        if ($attempt->voided_at) {
            return redirect()->route('practical.result', $attempt);
        }
        if ($attempt->submitted_at) {
            return redirect()->route('practical.result', $attempt);
        }

        $attempt->load('assessment.skill:id,name');

        $deadlineIso = $attempt->started_at
            ->copy()
            ->addMinutes($attempt->assessment->time_limit_minutes ?? self::TIME_LIMIT_MINUTES)
            ->toIso8601String();

        return Inertia::render('assessments/practical-take', [
            'attempt' => [
                'id' => $attempt->id,
                'skill_name' => $attempt->assessment->skill->name,
                'task_prompt' => $attempt->task_prompt,
                'deadline_at' => $deadlineIso,
                'started_at' => $attempt->started_at->toIso8601String(),
            ],
        ]);
    }

    public function submit(SkillAssessmentAttempt $attempt, Request $request): RedirectResponse
    {
        $alumni = $request->user()->alumniProfile;
        abort_unless($attempt->alumni_id === $alumni->id, 404);
        abort_if($attempt->submitted_at !== null, 422, 'Already submitted.');
        abort_if($attempt->voided_at !== null, 422, 'Attempt was voided.');

        $timeLimit = $attempt->assessment->time_limit_minutes ?? self::TIME_LIMIT_MINUTES;
        $deadline = $attempt->started_at->copy()->addMinutes($timeLimit)->addSeconds(5);
        if (now()->greaterThan($deadline)) {
            $attempt->update([
                'voided_at' => now(),
                'voided_reason' => 'time_expired',
                'submitted_at' => now(),
            ]);
            return redirect()->route('practical.result', $attempt);
        }

        $data = $request->validate([
            'submission_text' => ['required', 'string', 'min:80', 'max:5000'],
            'tab_switches' => ['nullable', 'integer', 'min:0'],
        ]);

        try {
            $rubric = collect($attempt->task_rubric ?? [])
                ->filter(fn ($item) => isset($item['criterion'], $item['weight']))
                ->values()
                ->all();

            $graded = $this->tasks->grade(
                taskPrompt: $attempt->task_prompt,
                rubric: $rubric,
                submission: $data['submission_text'],
                voiceTranscript: null,
            );
        } catch (\Throwable $e) {
            return back()->with('error', 'AI grader unavailable — try submit again in a moment. ('.$e->getMessage().')');
        }

        $passed = $graded['score'] >= 70;
        $submittedAt = now();

        DB::transaction(function () use ($attempt, $data, $graded, $passed, $submittedAt) {
            $attempt->update([
                'submitted_at' => $submittedAt,
                'duration_seconds' => $submittedAt->diffInSeconds($attempt->started_at),
                'score' => $graded['score'],
                'max_score' => 100,
                'passed' => $passed,
                'submission_text' => $data['submission_text'],
                'ai_feedback' => [
                    'feedback' => $graded['feedback'],
                    'summary' => $graded['summary'],
                ],
                'ai_generated_flag' => $graded['ai_generated_flag'],
                'tab_switches' => $data['tab_switches'] ?? 0,
            ]);
        });

        return redirect()->route('practical.result', $attempt);
    }

    public function void(SkillAssessmentAttempt $attempt, Request $request): JsonResponse
    {
        $alumni = $request->user()->alumniProfile;
        abort_unless($attempt->alumni_id === $alumni->id, 404);

        if ($attempt->submitted_at || $attempt->voided_at) {
            return response()->json(['ok' => true]);
        }

        $reason = $request->input('reason', 'unknown');
        $allowed = ['tab_switch', 'fullscreen_exit', 'blur', 'unknown'];

        $attempt->update([
            'voided_at' => now(),
            'voided_reason' => in_array($reason, $allowed, true) ? $reason : 'unknown',
            'submitted_at' => now(),
            'tab_switches' => (int) ($request->input('tab_switches') ?? $attempt->tab_switches),
        ]);

        return response()->json(['ok' => true]);
    }

    public function result(SkillAssessmentAttempt $attempt, Request $request): Response
    {
        $alumni = $request->user()->alumniProfile;
        abort_unless($attempt->alumni_id === $alumni->id, 404);

        $attempt->load('assessment.skill:id,name');

        $rubricItems = collect($attempt->task_rubric ?? [])
            ->filter(fn ($i) => isset($i['criterion']))
            ->values();
        $followUp = collect($attempt->task_rubric ?? [])
            ->firstWhere('follow_up_question') ?? null;

        return Inertia::render('assessments/practical-result', [
            'attempt' => [
                'id' => $attempt->id,
                'skill_name' => $attempt->assessment->skill->name,
                'score' => $attempt->score,
                'passed' => $attempt->passed,
                'voided_at' => $attempt->voided_at?->toIso8601String(),
                'voided_reason' => $attempt->voided_reason,
                'submitted_at' => $attempt->submitted_at?->toIso8601String(),
                'submission_text' => $attempt->submission_text,
                'ai_feedback' => $attempt->ai_feedback,
                'ai_generated_flag' => $attempt->ai_generated_flag,
                'staff_decision' => $attempt->staff_decision,
                'has_voice' => (bool) $attempt->voice_path,
                'task_prompt' => $attempt->task_prompt,
                'rubric' => $rubricItems,
                'follow_up_question' => $followUp['follow_up_question'] ?? null,
            ],
        ]);
    }

    public function uploadVoice(SkillAssessmentAttempt $attempt, Request $request): RedirectResponse
    {
        $alumni = $request->user()->alumniProfile;
        abort_unless($attempt->alumni_id === $alumni->id, 404);
        abort_if($attempt->submitted_at === null, 422, 'Submit the written task first.');
        abort_if(! $attempt->passed, 422, 'Voice confirmation is only for passing submissions.');
        abort_if($attempt->voided_at !== null, 422, 'Cannot add voice to a voided attempt.');

        $request->validate([
            'voice' => ['required', 'file', 'mimetypes:audio/webm,audio/ogg,audio/mp4,audio/mpeg,audio/wav', 'max:2048'],
        ]);

        if ($attempt->voice_path && Storage::disk('local')->exists($attempt->voice_path)) {
            Storage::disk('local')->delete($attempt->voice_path);
        }

        $path = $request->file('voice')->store("voice-confirmations/{$alumni->id}", 'local');
        $attempt->update([
            'voice_path' => $path,
            'voice_uploaded_at' => now(),
        ]);

        return back()->with('success', 'Voice confirmation uploaded. Staff will review your submission shortly.');
    }

    public function deleteVoice(SkillAssessmentAttempt $attempt, Request $request): RedirectResponse
    {
        $alumni = $request->user()->alumniProfile;
        abort_unless($attempt->alumni_id === $alumni->id, 404);

        if ($attempt->voice_path && Storage::disk('local')->exists($attempt->voice_path)) {
            Storage::disk('local')->delete($attempt->voice_path);
        }
        $attempt->update(['voice_path' => null, 'voice_uploaded_at' => null]);

        return back()->with('success', 'Voice recording deleted.');
    }

    public function streamVoice(SkillAssessmentAttempt $attempt, Request $request)
    {
        abort_unless($request->user()?->isStaff(), 403);
        abort_unless($attempt->voice_path && Storage::disk('local')->exists($attempt->voice_path), 404);

        return Storage::disk('local')->response($attempt->voice_path);
    }
}
