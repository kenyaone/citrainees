<?php

namespace App\Http\Controllers;

use App\Models\Alumni;
use App\Models\SkillAssessmentAttempt;
use App\Models\SkillVerificationRequest;
use App\Models\Verification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Inertia\Response;

class VerificationController extends Controller
{
    public function index(Request $request): Response
    {
        $tab = $request->string('tab', 'profile')->toString();
        $status = $request->string('status', 'pending')->toString();

        if ($tab === 'skills') {
            $items = SkillVerificationRequest::with([
                'alumni:id,first_name,last_name,ci_project_id',
                'alumni.ciProject:id,name,code',
                'skill:id,name,category',
                'reviewer:id,name',
            ])
                ->when(in_array($status, ['pending', 'approved', 'rejected'], true), fn ($q) => $q->where('status', $status))
                ->orderByDesc('created_at')
                ->paginate(20)
                ->withQueryString();

            $items->getCollection()->transform(function (SkillVerificationRequest $r) {
                $r->evidence_url = $r->evidence_path
                    ? Storage::url($r->evidence_path)
                    : null;
                return $r;
            });
        } elseif ($tab === 'practical') {
            $query = SkillAssessmentAttempt::query()
                ->whereHas('assessment', fn ($q) => $q->whereIn('type', ['practical', 'practical_video']))
                ->whereNotNull('submitted_at')
                ->whereNull('voided_at')
                ->where('passed', true)
                ->with([
                    'alumni:id,first_name,last_name,ci_project_id',
                    'alumni.ciProject:id,name,code',
                    'assessment.skill:id,name,category',
                    'staffReviewer:id,name',
                ]);
            if ($status === 'pending') {
                $query->whereNull('staff_decision');
            } elseif ($status === 'approved') {
                $query->where('staff_decision', 'approved');
            } elseif ($status === 'rejected') {
                $query->where('staff_decision', 'rejected');
            }
            $items = $query->orderByDesc('submitted_at')->paginate(20)->withQueryString();

            $items->getCollection()->transform(function (SkillAssessmentAttempt $a) {
                $a->voice_stream_url = $a->voice_path
                    ? URL::signedRoute('practical.voice.stream', ['attempt' => $a->id], now()->addMinutes(5))
                    : null;
                $a->video_stream_url = $a->video_path
                    ? URL::signedRoute('practical.video.stream', ['attempt' => $a->id], now()->addMinutes(5))
                    : null;
                return $a;
            });
        } else {
            $items = Verification::with([
                'alumni:id,first_name,last_name,ci_project_id',
                'alumni.ciProject:id,name,code',
                'submitter:id,name',
                'reviewer:id,name',
            ])
                ->when(in_array($status, ['pending', 'approved', 'rejected'], true), fn ($q) => $q->where('status', $status))
                ->orderByDesc('created_at')
                ->paginate(20)
                ->withQueryString();
        }

        return Inertia::render('verifications/index', [
            'tab' => $tab,
            'items' => $items,
            'status' => $status,
            'counts' => [
                'profile' => [
                    'pending' => Verification::where('status', 'pending')->count(),
                    'approved' => Verification::where('status', 'approved')->count(),
                    'rejected' => Verification::where('status', 'rejected')->count(),
                ],
                'skills' => [
                    'pending' => SkillVerificationRequest::where('status', 'pending')->count(),
                    'approved' => SkillVerificationRequest::where('status', 'approved')->count(),
                    'rejected' => SkillVerificationRequest::where('status', 'rejected')->count(),
                ],
                'practical' => [
                    'pending' => SkillAssessmentAttempt::query()
                        ->whereHas('assessment', fn ($q) => $q->whereIn('type', ['practical', 'practical_video']))
                        ->whereNotNull('submitted_at')
                        ->whereNull('voided_at')
                        ->where('passed', true)
                        ->whereNull('staff_decision')
                        ->count(),
                    'approved' => SkillAssessmentAttempt::query()
                        ->whereHas('assessment', fn ($q) => $q->whereIn('type', ['practical', 'practical_video']))
                        ->where('staff_decision', 'approved')->count(),
                    'rejected' => SkillAssessmentAttempt::query()
                        ->whereHas('assessment', fn ($q) => $q->whereIn('type', ['practical', 'practical_video']))
                        ->where('staff_decision', 'rejected')->count(),
                ],
            ],
        ]);
    }

    public function decidePractical(SkillAssessmentAttempt $attempt, Request $request): RedirectResponse
    {
        abort_unless($attempt->submitted_at !== null && $attempt->voided_at === null, 422);
        abort_unless($attempt->passed, 422, 'Only passing attempts can be reviewed.');
        abort_unless($attempt->staff_decision === null, 422, 'Already decided.');

        $data = $request->validate([
            'decision' => ['required', 'in:approved,rejected'],
            'reviewer_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($attempt, $data, $request) {
            $attempt->update([
                'staff_decision' => $data['decision'],
                'staff_reviewed_at' => now(),
                'staff_reviewer_id' => $request->user()->id,
                'ai_feedback' => array_merge(
                    is_array($attempt->ai_feedback) ? $attempt->ai_feedback : [],
                    ['reviewer_notes' => $data['reviewer_notes'] ?? null],
                ),
            ]);

            if ($data['decision'] === 'approved') {
                $method = $attempt->assessment->type === 'practical_video' ? 'video' : 'practical';
                $attempt->alumni->skills()->updateExistingPivot($attempt->assessment->skill_id, [
                    'verified_at' => now(),
                    'verified_via' => $method,
                    'verified_by' => $request->user()->id,
                ]);
            }
        });

        return back()->with('success', 'Decision recorded.');
    }

    public function approve(Verification $verification, Request $request): RedirectResponse
    {
        abort_unless($verification->status === 'pending', 422, 'Only pending verifications can be approved.');

        if ($verification->subject_type !== Alumni::class) {
            abort(422, 'Unsupported verification subject.');
        }

        $alumni = Alumni::find($verification->subject_id);
        abort_unless($alumni, 404);

        DB::transaction(function () use ($verification, $alumni, $request) {
            $changes = $verification->proposed_changes;
            $skillIds = null;
            $attrs = [];

            foreach ($changes as $field => $entry) {
                if ($field === 'skill_ids') {
                    $skillIds = $entry['to'] ?? [];
                } else {
                    $attrs[$field] = $entry['to'] ?? null;
                }
            }

            if (! empty($attrs)) {
                $alumni->update([
                    ...$attrs,
                    'verified_at' => now(),
                    'verified_by' => $request->user()->id,
                ]);
            } else {
                $alumni->update([
                    'verified_at' => now(),
                    'verified_by' => $request->user()->id,
                ]);
            }

            if ($skillIds !== null) {
                $alumni->skills()->sync($skillIds);
            }

            $verification->update([
                'status' => 'approved',
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
            ]);
        });

        return back()->with('success', 'Changes approved and applied.');
    }

    public function reject(Verification $verification, Request $request): RedirectResponse
    {
        abort_unless($verification->status === 'pending', 422, 'Only pending verifications can be rejected.');

        $data = $request->validate([
            'reviewer_notes' => ['required', 'string', 'max:1000'],
        ]);

        $verification->update([
            'status' => 'rejected',
            'reviewer_notes' => $data['reviewer_notes'],
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Changes rejected.');
    }
}
