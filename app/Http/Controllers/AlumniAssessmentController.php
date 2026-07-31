<?php

namespace App\Http\Controllers;

use App\Models\SkillAssessment;
use App\Models\SkillAssessmentAttempt;
use App\Models\SkillVerificationRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AlumniAssessmentController extends Controller
{
    private const COOLDOWN_DAYS = 7;

    public function index(Request $request): Response
    {
        $alumni = $request->user()->alumniProfile;
        $alumni->load('skills');

        $regulatedSlugs = config('assessments.regulated_skill_slugs', []);

        $assessmentsBySkill = SkillAssessment::where('is_active', true)
            ->whereIn('skill_id', $alumni->skills->pluck('id'))
            ->withCount('questions')
            ->get()
            ->keyBy('skill_id');

        $certRequests = SkillVerificationRequest::where('alumni_id', $alumni->id)
            ->whereIn('skill_id', $alumni->skills->pluck('id'))
            ->orderByDesc('created_at')
            ->get()
            ->groupBy('skill_id');

        $latestAttempts = SkillAssessmentAttempt::where('alumni_id', $alumni->id)
            ->orderByDesc('created_at')
            ->get()
            ->groupBy('skill_assessment_id');

        $skillItems = $alumni->skills->map(function ($skill) use ($assessmentsBySkill, $certRequests, $latestAttempts, $regulatedSlugs) {
            $pivot = $skill->pivot;
            $verified = $pivot?->verified_at !== null;

            $assessment = $assessmentsBySkill[$skill->id] ?? null;
            $quizPath = null;
            if ($assessment) {
                $latest = $latestAttempts[$assessment->id][0] ?? null;
                $cooldownUntil = null;
                if ($latest && ! $latest->passed && $latest->submitted_at) {
                    $unlockAt = $latest->submitted_at->copy()->addDays(self::COOLDOWN_DAYS);
                    if ($unlockAt->isFuture()) {
                        $cooldownUntil = $unlockAt->toIso8601String();
                    }
                }
                $quizPath = [
                    'assessment_id' => $assessment->id,
                    'title' => $assessment->title,
                    'description' => $assessment->description,
                    'question_count' => $assessment->questions_count,
                    'pass_threshold' => $assessment->pass_threshold,
                    'time_limit_minutes' => $assessment->time_limit_minutes,
                    'latest_attempt' => $latest ? [
                        'id' => $latest->id,
                        'score' => $latest->score,
                        'max_score' => $latest->max_score,
                        'passed' => $latest->passed,
                        'submitted_at' => $latest->submitted_at?->toIso8601String(),
                    ] : null,
                    'cooldown_until' => $cooldownUntil,
                ];
            }

            $certList = ($certRequests[$skill->id] ?? collect())->map(fn ($r) => [
                'id' => $r->id,
                'status' => $r->status,
                'reviewer_notes' => $r->reviewer_notes,
                'created_at' => $r->created_at->toIso8601String(),
                'reviewed_at' => $r->reviewed_at?->toIso8601String(),
            ])->values();

            return [
                'id' => $skill->id,
                'name' => $skill->name,
                'category' => $skill->category,
                'verified' => $verified,
                'verified_via' => $pivot?->verified_via,
                'verified_at' => $pivot?->verified_at,
                'quiz_path' => $quizPath,
                'certificate_requests' => $certList,
                'is_regulated' => in_array($skill->slug, $regulatedSlugs, true),
            ];
        })->values();

        $summary = [
            'total' => $skillItems->count(),
            'verified' => $skillItems->where('verified', true)->count(),
            'quiz_available' => $skillItems->whereNotNull('quiz_path')->count(),
            'cert_pending' => $skillItems->filter(fn ($s) => collect($s['certificate_requests'])->contains('status', 'pending'))->count(),
        ];

        return Inertia::render('assessments/index', [
            'skills' => $skillItems,
            'summary' => $summary,
        ]);
    }

    public function start(SkillAssessment $assessment, Request $request): RedirectResponse
    {
        $alumni = $request->user()->alumniProfile;

        abort_unless(
            $alumni->skills->contains($assessment->skill_id),
            403,
            'Add this skill to your profile before taking the assessment.',
        );

        $active = SkillAssessmentAttempt::where('alumni_id', $alumni->id)
            ->where('skill_assessment_id', $assessment->id)
            ->whereNull('submitted_at')
            ->first();

        if ($active) {
            return redirect()->route('assessments.take', $active);
        }

        $latest = SkillAssessmentAttempt::where('alumni_id', $alumni->id)
            ->where('skill_assessment_id', $assessment->id)
            ->latest('submitted_at')
            ->first();

        if ($latest && $latest->passed) {
            return redirect()->route('assessments.index')->with('error', 'You have already passed this assessment.');
        }

        if ($latest && ! $latest->passed && $latest->submitted_at) {
            $unlockAt = $latest->submitted_at->copy()->addDays(self::COOLDOWN_DAYS);
            if ($unlockAt->isFuture()) {
                return redirect()->route('assessments.index')->with('error', 'You can retry this assessment on '.$unlockAt->toFormattedDateString().'.');
            }
        }

        $attempt = SkillAssessmentAttempt::create([
            'alumni_id' => $alumni->id,
            'skill_assessment_id' => $assessment->id,
            'started_at' => now(),
        ]);

        return redirect()->route('assessments.take', $attempt);
    }

    public function take(SkillAssessmentAttempt $attempt, Request $request): Response|RedirectResponse
    {
        $alumni = $request->user()->alumniProfile;
        abort_unless($attempt->alumni_id === $alumni->id, 404);

        if ($attempt->submitted_at) {
            return redirect()->route('assessments.result', $attempt);
        }

        $attempt->load('assessment.skill:id,name');
        $questions = $attempt->assessment->questions()->get()->map(fn ($q) => [
            'id' => $q->id,
            'question_text' => $q->question_text,
            'options' => $q->options,
        ]);

        $deadlineIso = null;
        if ($attempt->assessment->time_limit_minutes) {
            $deadlineIso = $attempt->started_at
                ->copy()
                ->addMinutes($attempt->assessment->time_limit_minutes)
                ->toIso8601String();
        }

        return Inertia::render('assessments/take', [
            'attempt' => [
                'id' => $attempt->id,
                'started_at' => $attempt->started_at->toIso8601String(),
                'deadline_at' => $deadlineIso,
            ],
            'assessment' => [
                'id' => $attempt->assessment->id,
                'title' => $attempt->assessment->title,
                'skill_name' => $attempt->assessment->skill->name,
                'pass_threshold' => $attempt->assessment->pass_threshold,
                'time_limit_minutes' => $attempt->assessment->time_limit_minutes,
            ],
            'questions' => $questions,
        ]);
    }

    public function submit(SkillAssessmentAttempt $attempt, Request $request): RedirectResponse
    {
        $alumni = $request->user()->alumniProfile;
        abort_unless($attempt->alumni_id === $alumni->id, 404);
        abort_if($attempt->submitted_at !== null, 422, 'Attempt already submitted.');

        $data = $request->validate([
            'answers' => ['required', 'array'],
            'answers.*' => ['nullable', 'integer', 'min:0'],
        ]);

        $questions = $attempt->assessment->questions()->get()->keyBy('id');
        $score = 0;
        $maxScore = 0;
        $normalizedAnswers = [];

        foreach ($questions as $q) {
            $maxScore += $q->points;
            $submitted = $data['answers'][$q->id] ?? null;
            $normalizedAnswers[$q->id] = $submitted;
            if ($submitted !== null && (int) $submitted === $q->correct_index) {
                $score += $q->points;
            }
        }

        $scorePercent = $maxScore > 0 ? ($score / $maxScore) * 100 : 0;
        $passed = $scorePercent >= $attempt->assessment->pass_threshold;
        $submittedAt = now();

        DB::transaction(function () use ($attempt, $score, $maxScore, $passed, $normalizedAnswers, $submittedAt, $alumni) {
            $attempt->update([
                'submitted_at' => $submittedAt,
                'duration_seconds' => (int) abs($submittedAt->diffInSeconds($attempt->started_at)),
                'score' => $score,
                'max_score' => $maxScore,
                'passed' => $passed,
                'answers' => $normalizedAnswers,
            ]);

            if ($passed) {
                $alumni->skills()->updateExistingPivot($attempt->assessment->skill_id, [
                    'verified_at' => now(),
                    'verified_via' => 'quiz',
                    'verified_by' => null,
                ]);
            }
        });

        return redirect()->route('assessments.result', $attempt);
    }

    public function result(SkillAssessmentAttempt $attempt, Request $request): Response
    {
        $alumni = $request->user()->alumniProfile;
        abort_unless($attempt->alumni_id === $alumni->id, 404);
        abort_if($attempt->submitted_at === null, 404);

        $attempt->load('assessment.skill:id,name');

        $unlockAt = null;
        if (! $attempt->passed) {
            $unlockAt = $attempt->submitted_at->copy()->addDays(self::COOLDOWN_DAYS)->toIso8601String();
        }

        return Inertia::render('assessments/result', [
            'attempt' => [
                'id' => $attempt->id,
                'score' => $attempt->score,
                'max_score' => $attempt->max_score,
                'score_percent' => $attempt->scorePercent(),
                'passed' => $attempt->passed,
                'submitted_at' => $attempt->submitted_at->toIso8601String(),
                'duration_seconds' => $attempt->duration_seconds,
            ],
            'assessment' => [
                'title' => $attempt->assessment->title,
                'skill_name' => $attempt->assessment->skill->name,
                'pass_threshold' => $attempt->assessment->pass_threshold,
            ],
            'unlock_at' => $unlockAt,
        ]);
    }
}
