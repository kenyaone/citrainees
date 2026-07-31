<?php

namespace App\Http\Controllers;

use App\Models\SkillAssessmentAttempt;
use App\Models\Skill;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Inertia\Response;

class EmployerReviewController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $categories = collect($user->reviewer_categories ?? []);

        $allCategories = Skill::query()
            ->whereNotNull('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        // Only surface video reviews to employer-reviewers. Written-practical + text
        // is staff-only for now — video is what the "human familiar with the skill"
        // audience actually adds value on.
        $queue = collect();
        if ($categories->isNotEmpty()) {
            $queue = SkillAssessmentAttempt::query()
                ->whereHas('assessment', fn ($q) => $q->where('type', 'practical_video'))
                ->whereHas('assessment.skill', fn ($q) => $q->whereIn('category', $categories))
                ->whereNotNull('submitted_at')
                ->whereNotNull('video_path')
                ->whereNull('voided_at')
                ->where('passed', true)
                ->whereNull('staff_decision')
                ->with([
                    'alumni:id,first_name,last_name,ci_project_id',
                    'alumni.ciProject:id,name',
                    'assessment.skill:id,name,category',
                ])
                ->orderByDesc('submitted_at')
                ->limit(50)
                ->get()
                ->map(fn (SkillAssessmentAttempt $a) => [
                    'id' => $a->id,
                    'submitted_at' => $a->submitted_at?->toIso8601String(),
                    'task_prompt' => $a->task_prompt,
                    'submission_caption' => $a->submission_caption,
                    'video_stream_url' => URL::signedRoute('practical.video.stream', ['attempt' => $a->id], now()->addMinutes(5)),
                    'alumni' => [
                        'first_name' => $a->alumni->first_name,
                        'last_name' => $a->alumni->last_name,
                        'ci_project' => $a->alumni->ciProject?->name,
                    ],
                    'skill' => [
                        'name' => $a->assessment->skill->name,
                        'category' => $a->assessment->skill->category,
                    ],
                ]);
        }

        return Inertia::render('my-reviews/index', [
            'reviewer' => [
                'name' => $user->name,
                'organisation' => $user->organisation,
                'reviewer_categories' => $categories->all(),
                'review_count' => $user->review_count ?? 0,
            ],
            'all_categories' => $allCategories,
            'queue' => $queue,
        ]);
    }

    public function saveCategories(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'reviewer_categories' => ['nullable', 'array'],
            'reviewer_categories.*' => ['string', 'max:100'],
            'organisation' => ['nullable', 'string', 'max:150'],
        ]);

        $request->user()->update([
            'reviewer_categories' => $data['reviewer_categories'] ?? [],
            'organisation' => $data['organisation'] ?? $request->user()->organisation,
        ]);

        return back()->with('success', 'Review categories updated.');
    }

    public function decide(Request $request, SkillAssessmentAttempt $attempt): RedirectResponse
    {
        $user = $request->user();
        $categories = collect($user->reviewer_categories ?? []);

        abort_unless($attempt->submitted_at !== null && $attempt->voided_at === null, 422);
        abort_unless($attempt->passed, 422);
        abort_unless($attempt->staff_decision === null, 422, 'Already decided.');

        $attempt->loadMissing('assessment.skill:id,name,category');
        abort_unless(
            $categories->contains($attempt->assessment->skill->category),
            403,
            "This submission isn't in your review categories.",
        );

        $data = $request->validate([
            'decision' => ['required', 'in:approved,rejected'],
            'reviewer_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($attempt, $data, $user) {
            $attempt->update([
                'staff_decision' => $data['decision'],
                'staff_reviewed_at' => now(),
                'staff_reviewer_id' => $user->id,
                'ai_feedback' => array_merge(
                    is_array($attempt->ai_feedback) ? $attempt->ai_feedback : [],
                    [
                        'reviewer_notes' => $data['reviewer_notes'] ?? null,
                        'reviewer_type' => 'employer',
                        'reviewer_organisation' => $user->organisation,
                    ],
                ),
            ]);

            if ($data['decision'] === 'approved') {
                $attempt->alumni->skills()->updateExistingPivot($attempt->assessment->skill_id, [
                    'verified_at' => now(),
                    'verified_via' => 'employer_reviewer',
                    'verified_by' => $user->id,
                ]);
            }

            $user->increment('review_count');
        });

        return back()->with('success', 'Decision recorded.');
    }
}
