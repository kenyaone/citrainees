<?php

namespace App\Http\Controllers;

use App\Models\Alumni;
use App\Models\Verification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class VerificationController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->string('status', 'pending')->toString();

        $verifications = Verification::with([
            'alumni:id,first_name,last_name,ci_project_id',
            'alumni.ciProject:id,name,code',
            'submitter:id,name',
            'reviewer:id,name',
        ])
            ->when(in_array($status, ['pending', 'approved', 'rejected'], true), fn ($q) => $q->where('status', $status))
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('verifications/index', [
            'verifications' => $verifications,
            'status' => $status,
            'counts' => [
                'pending' => Verification::where('status', 'pending')->count(),
                'approved' => Verification::where('status', 'approved')->count(),
                'rejected' => Verification::where('status', 'rejected')->count(),
            ],
        ]);
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
