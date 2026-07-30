<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEducationRecordRequest;
use App\Http\Requests\StoreEmploymentRecordRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
        ]);

        return Inertia::render('my-profile', [
            'alumni' => $alumni,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $alumni = $request->user()->alumniProfile;

        $data = $request->validate([
            'phone_primary' => ['nullable', 'string', 'max:32'],
            'email_secondary' => ['nullable', 'email', 'max:255'],
            'current_status' => ['nullable', 'in:studying,employed,self_employed,unemployed,seeking,unknown'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'county' => ['nullable', 'string', 'max:64'],
            'sub_county' => ['nullable', 'string', 'max:64'],
            'is_public' => ['sometimes', 'boolean'],
        ]);

        $alumni->update([
            ...$data,
            'verified_at' => null,
            'verified_by' => null,
        ]);

        return back()->with('success', 'Profile updated. Staff will review the changes.');
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
}
