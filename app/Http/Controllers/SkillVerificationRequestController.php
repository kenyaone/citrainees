<?php

namespace App\Http\Controllers;

use App\Models\SkillVerificationRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class SkillVerificationRequestController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $alumni = $request->user()->alumniProfile;

        $data = $request->validate([
            'skill_id' => ['required', 'integer', 'exists:skills,id'],
            'evidence' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'alumni_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        abort_unless(
            $alumni->skills->contains($data['skill_id']),
            403,
            'Tag this skill on your profile before submitting a certificate.',
        );

        $pending = SkillVerificationRequest::where('alumni_id', $alumni->id)
            ->where('skill_id', $data['skill_id'])
            ->where('status', 'pending')
            ->exists();

        if ($pending) {
            return back()->with('error', 'You already have a pending certificate for this skill. Wait for staff to review it.');
        }

        $file = $request->file('evidence');
        $path = $file->store("skill-certificates/{$alumni->id}", 'public');

        SkillVerificationRequest::create([
            'alumni_id' => $alumni->id,
            'skill_id' => $data['skill_id'],
            'method' => 'certificate',
            'evidence_path' => $path,
            'evidence_original_name' => $file->getClientOriginalName(),
            'alumni_notes' => $data['alumni_notes'] ?? null,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Certificate submitted for review. Staff will confirm within a few days.');
    }

    public function approve(SkillVerificationRequest $skillVerification, Request $request): RedirectResponse
    {
        abort_unless($skillVerification->status === 'pending', 422, 'Only pending requests can be approved.');

        DB::transaction(function () use ($skillVerification, $request) {
            $alumni = $skillVerification->alumni;

            if (! $alumni->skills->contains($skillVerification->skill_id)) {
                $alumni->skills()->attach($skillVerification->skill_id);
            }

            $alumni->skills()->updateExistingPivot($skillVerification->skill_id, [
                'verified_at' => now(),
                'verified_via' => 'certificate',
                'verified_by' => $request->user()->id,
            ]);

            $skillVerification->update([
                'status' => 'approved',
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
            ]);
        });

        return back()->with('success', 'Certificate approved and skill verified.');
    }

    public function reject(SkillVerificationRequest $skillVerification, Request $request): RedirectResponse
    {
        abort_unless($skillVerification->status === 'pending', 422, 'Only pending requests can be rejected.');

        $data = $request->validate([
            'reviewer_notes' => ['required', 'string', 'max:1000'],
        ]);

        $skillVerification->update([
            'status' => 'rejected',
            'reviewer_notes' => $data['reviewer_notes'],
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Certificate rejected.');
    }

    public function destroy(SkillVerificationRequest $skillVerification): RedirectResponse
    {
        if ($skillVerification->evidence_path) {
            Storage::disk('public')->delete($skillVerification->evidence_path);
        }
        $skillVerification->delete();

        return back()->with('success', 'Request removed.');
    }
}
