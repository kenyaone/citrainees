<?php

namespace App\Http\Controllers;

use App\Models\EmploymentRecord;
use App\Models\Skill;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class EmploymentConfirmationController extends Controller
{
    private const TOKEN_TTL_DAYS = 60;

    public function issue(EmploymentRecord $employmentRecord, Request $request): RedirectResponse
    {
        $user = $request->user();
        $alumni = $employmentRecord->alumni;

        abort_unless(
            $user->isStaff() || ($user->alumniProfile && $user->alumniProfile->id === $alumni->id),
            403,
        );

        abort_if($employmentRecord->confirmed_at !== null, 422, 'Employment already confirmed.');

        if (! $employmentRecord->confirmation_token || $employmentRecord->confirmation_token_expires_at?->isPast()) {
            $employmentRecord->update([
                'confirmation_token' => Str::random(48),
                'confirmation_token_expires_at' => now()->addDays(self::TOKEN_TTL_DAYS),
            ]);
        }

        return back();
    }

    public function regenerate(EmploymentRecord $employmentRecord, Request $request): RedirectResponse
    {
        $user = $request->user();
        $alumni = $employmentRecord->alumni;

        abort_unless(
            $user->isStaff() || ($user->alumniProfile && $user->alumniProfile->id === $alumni->id),
            403,
        );

        abort_if($employmentRecord->confirmed_at !== null, 422, 'Employment already confirmed.');

        $employmentRecord->update([
            'confirmation_token' => Str::random(48),
            'confirmation_token_expires_at' => now()->addDays(self::TOKEN_TTL_DAYS),
        ]);

        return back()->with('success', 'Fresh confirmation link generated.');
    }

    public function show(string $token): Response
    {
        $record = $this->findValidToken($token);

        if (! $record) {
            return Inertia::render('employment-confirm-invalid');
        }

        $record->load([
            'alumni:id,first_name,last_name,ci_project_id',
            'alumni.ciProject:id,name,code',
            'alumni.skills:id,name,category',
        ]);

        return Inertia::render('employment-confirm', [
            'record' => [
                'id' => $record->id,
                'employer_name' => $record->employer_name,
                'role_title' => $record->role_title,
                'sector' => $record->sector,
                'county' => $record->county,
                'start_date' => $record->start_date?->format('Y-m-d'),
                'end_date' => $record->end_date?->format('Y-m-d'),
                'is_current' => $record->is_current,
                'description' => $record->description,
            ],
            'alumni' => [
                'first_name' => $record->alumni->first_name,
                'last_name' => $record->alumni->last_name,
                'ci_project_name' => $record->alumni->ciProject?->name,
            ],
            'skills' => $record->alumni->skills->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'category' => $s->category,
            ]),
            'token' => $token,
        ]);
    }

    public function store(string $token, Request $request): RedirectResponse
    {
        $record = $this->findValidToken($token);
        abort_if(! $record, 404, 'Confirmation link is invalid or expired.');
        abort_if($record->confirmed_at !== null, 422, 'This employment has already been confirmed.');

        $data = $request->validate([
            'confirmer_name' => ['required', 'string', 'max:255'],
            'confirmer_email' => ['required', 'email', 'max:255'],
            'confirmer_role' => ['required', 'string', 'max:255'],
            'confirmer_notes' => ['nullable', 'string', 'max:2000'],
            'confirmed_skill_ids' => ['nullable', 'array'],
            'confirmed_skill_ids.*' => ['integer', 'exists:skills,id'],
        ]);

        $confirmedSkillIds = array_map('intval', $data['confirmed_skill_ids'] ?? []);

        DB::transaction(function () use ($record, $data, $confirmedSkillIds) {
            $record->update([
                'confirmed_at' => now(),
                'confirmer_name' => $data['confirmer_name'],
                'confirmer_email' => $data['confirmer_email'],
                'confirmer_role' => $data['confirmer_role'],
                'confirmer_notes' => $data['confirmer_notes'] ?? null,
                'confirmed_skill_ids' => $confirmedSkillIds,
                'verified_at' => now(),
                'confirmation_token' => null,
                'confirmation_token_expires_at' => null,
            ]);

            if (! empty($confirmedSkillIds)) {
                $alumni = $record->alumni;
                foreach ($confirmedSkillIds as $skillId) {
                    if (! $alumni->skills()->where('skill_id', $skillId)->exists()) {
                        $alumni->skills()->attach($skillId);
                    }
                    $alumni->skills()->updateExistingPivot($skillId, [
                        'verified_at' => now(),
                        'verified_via' => 'employer',
                        'verified_by' => null,
                    ]);
                }
            }
        });

        return redirect()->route('employment-confirm.thanks');
    }

    public function thanks(): Response
    {
        return Inertia::render('employment-confirm-thanks');
    }

    private function findValidToken(string $token): ?EmploymentRecord
    {
        return EmploymentRecord::where('confirmation_token', $token)
            ->where('confirmation_token_expires_at', '>=', now())
            ->whereNull('confirmed_at')
            ->first();
    }
}
