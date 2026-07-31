<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEducationRecordRequest;
use App\Http\Requests\StoreEmploymentRecordRequest;
use App\Models\Alumni;
use App\Models\EducationRecord;
use App\Models\Skill;
use App\Models\SkillVerificationRequest;
use App\Models\Verification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AlumniSelfController extends Controller
{
    public function edit(Request $request): Response
    {
        $alumni = $request->user()->alumniProfile;

        $alumni->load([
            'ciProject:id,name,code',
            'educationRecords' => fn ($q) => $q->orderByDesc('end_year'),
            'employmentRecords' => fn ($q) => $q->orderByDesc('is_current')->orderByDesc('start_date'),
            'skills:id,name,category',
        ]);

        $pendingSkillCerts = SkillVerificationRequest::query()
            ->where('alumni_id', $alumni->id)
            ->where('status', 'pending')
            ->get(['id', 'skill_id', 'evidence_original_name', 'created_at'])
            ->keyBy('skill_id');

        return Inertia::render('my-profile', [
            'alumni' => $alumni,
            'photo_url' => $alumni->profile_photo_path
                ? Storage::disk('public')->url($alumni->profile_photo_path)
                : null,
            'counties' => config('kenya_counties'),
            'skills' => Skill::orderBy('category')->orderBy('name')->get(['id', 'name', 'category']),
            'pending_skill_certs' => $pendingSkillCerts,
            'onboarding' => $this->onboardingSteps($alumni, $pendingSkillCerts),
        ]);
    }

    private function onboardingSteps($alumni, $pendingSkillCerts): array
    {
        $skills = $alumni->skills ?? collect();
        $educationRecords = $alumni->educationRecords ?? collect();
        $employmentRecords = $alumni->employmentRecords ?? collect();

        $hasPhoto = ! empty($alumni->profile_photo_path);
        $skillsTagged = $skills->count() >= 3;
        $hasVerifiedOrPendingSkillCert = $skills->contains(fn ($s) => (bool) $s->pivot?->verified_at)
            || $pendingSkillCerts->count() > 0
            || $educationRecords->contains(fn ($e) => ! empty($e->certificate_path));
        $hasEducation = $educationRecords->count() > 0;
        $hasEmployment = $employmentRecords->count() > 0;
        $employerConfirmRequested = $employmentRecords->contains(
            fn ($e) => ! empty($e->confirmation_token) || ! empty($e->confirmed_at),
        );
        $publicOptedIn = (bool) $alumni->is_public;
        $stillStudying = $alumni->current_status === 'studying'
            || $educationRecords->contains(fn ($e) => $e->completion_status === 'ongoing');

        $steps = [
            ['key' => 'photo', 'label' => 'Add a profile photo', 'done' => $hasPhoto, 'hint' => 'Use the camera button on your avatar.'],
            ['key' => 'skills', 'label' => 'Tag at least 3 skills', 'done' => $skillsTagged, 'hint' => 'Employers filter by skill first.'],
            ['key' => 'cert', 'label' => 'Upload one certificate', 'done' => $hasVerifiedOrPendingSkillCert, 'hint' => 'Skill or education — either counts.'],
            ['key' => 'education', 'label' => 'Add your education', 'done' => $hasEducation, 'hint' => 'TVET, college, or university.'],
        ];

        // Work-history + employer confirmation only kick in for alumni who have
        // finished studying. In-college users are nudged on the other four instead.
        if (! $stillStudying) {
            $steps[] = ['key' => 'employment', 'label' => 'Add current or past work', 'done' => $hasEmployment, 'hint' => 'Include internships or attachments.'];
            $steps[] = ['key' => 'confirm', 'label' => 'Ask an employer to confirm', 'done' => $employerConfirmRequested, 'hint' => 'The strongest verification signal.'];
        }

        $steps[] = ['key' => 'public', 'label' => 'Opt in to public directory', 'done' => $publicOptedIn, 'hint' => 'Toggle at the bottom of "Contact & status".'];

        return $steps;
    }

    public function update(Request $request): RedirectResponse
    {
        $alumni = $request->user()->alumniProfile;

        $data = $request->validate([
            'phone_primary' => ['nullable', 'string', 'max:32'],
            'email_secondary' => ['nullable', 'email', 'max:255'],
            'current_status' => ['nullable', 'in:studying,employed,self_employed,unemployed,seeking,unknown'],
            'gender' => ['nullable', 'in:female,male,other,prefer_not_to_say'],
            'preferred_language' => ['nullable', 'in:en,sw'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'county' => ['nullable', 'string', 'max:64', 'in:'.implode(',', array_keys(config('kenya_counties')))],
            'sub_county' => ['nullable', 'string', 'max:64'],
            'is_public' => ['sometimes', 'boolean'],
            'skill_ids' => ['nullable', 'array'],
            'skill_ids.*' => ['integer', 'exists:skills,id'],
        ]);

        $currentSkillIds = $alumni->skills->pluck('id')->sort()->values()->all();
        $proposedSkillIds = collect($data['skill_ids'] ?? $currentSkillIds)
            ->map(fn ($id) => (int) $id)
            ->sort()
            ->values()
            ->all();
        unset($data['skill_ids']);

        $skillsChanged = $currentSkillIds !== $proposedSkillIds;

        // Apply skill tagging immediately — it's a self-declared claim that only
        // becomes trusted once verified via quiz / certificate / employer / practical.
        // Waiting on staff review here blocks alumni from starting an assessment.
        if ($skillsChanged) {
            $alumni->skills()->sync(
                array_fill_keys($proposedSkillIds, ['proficiency' => null])
            );
        }

        $diff = [];
        foreach ($data as $field => $newValue) {
            $currentValue = $alumni->getAttribute($field);
            if ((string) $currentValue !== (string) $newValue) {
                $diff[$field] = ['from' => $currentValue, 'to' => $newValue];
            }
        }

        if (empty($diff)) {
            return back()->with(
                'success',
                $skillsChanged ? 'Skills updated.' : 'No changes to save.',
            );
        }

        Verification::create([
            'alumni_id' => $alumni->id,
            'submitted_by' => $request->user()->id,
            'subject_type' => Alumni::class,
            'subject_id' => $alumni->id,
            'proposed_changes' => $diff,
            'status' => 'pending',
        ]);

        return back()->with(
            'success',
            $skillsChanged
                ? 'Skills updated. Other changes submitted for review — staff will approve them shortly.'
                : 'Changes submitted for review. Staff will approve them shortly.',
        );
    }

    public function addEducation(StoreEducationRecordRequest $request): RedirectResponse
    {
        $alumni = $request->user()->alumniProfile;
        $alumni->educationRecords()->create($request->validated());

        return back()->with('success', 'Education record added.');
    }

    public function addEmployment(StoreEmploymentRecordRequest $request): RedirectResponse
    {
        $alumni = $request->user()->alumniProfile;
        $alumni->employmentRecords()->create($request->validated());

        return back()->with('success', 'Employment record added.');
    }

    public function uploadPhoto(Request $request): RedirectResponse
    {
        $alumni = $request->user()->alumniProfile;

        $request->validate([
            'photo' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:3072'],
        ]);

        if ($alumni->profile_photo_path && Storage::disk('public')->exists($alumni->profile_photo_path)) {
            Storage::disk('public')->delete($alumni->profile_photo_path);
        }

        $path = $request->file('photo')->store("profile-photos/{$alumni->id}", 'public');
        $alumni->update(['profile_photo_path' => $path]);

        return back()->with('success', 'Photo updated.');
    }

    public function deletePhoto(Request $request): RedirectResponse
    {
        $alumni = $request->user()->alumniProfile;

        if ($alumni->profile_photo_path && Storage::disk('public')->exists($alumni->profile_photo_path)) {
            Storage::disk('public')->delete($alumni->profile_photo_path);
        }

        $alumni->update(['profile_photo_path' => null]);

        return back()->with('success', 'Photo removed.');
    }

    public function uploadEducationCertificate(Request $request, EducationRecord $educationRecord): RedirectResponse
    {
        $alumni = $request->user()->alumniProfile;
        abort_unless($educationRecord->alumni_id === $alumni->id, 403);

        $request->validate([
            'certificate' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        if ($educationRecord->certificate_path && Storage::disk('public')->exists($educationRecord->certificate_path)) {
            Storage::disk('public')->delete($educationRecord->certificate_path);
        }

        $path = $request->file('certificate')->store("education-certs/{$alumni->id}", 'public');
        $educationRecord->update(['certificate_path' => $path]);

        return back()->with('success', 'Education certificate uploaded — staff will verify it shortly.');
    }
}
