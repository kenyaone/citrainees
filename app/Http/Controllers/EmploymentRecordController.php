<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEmploymentRecordRequest;
use App\Models\Alumni;
use App\Models\EmploymentRecord;
use Illuminate\Http\RedirectResponse;

class EmploymentRecordController extends Controller
{
    public function store(StoreEmploymentRecordRequest $request, Alumni $alumni): RedirectResponse
    {
        $alumni->employmentRecords()->create($request->validated());

        return back()->with('success', 'Employment record added.');
    }

    public function destroy(Alumni $alumni, EmploymentRecord $employmentRecord): RedirectResponse
    {
        abort_unless($employmentRecord->alumni_id === $alumni->id, 404);

        $employmentRecord->delete();

        return back()->with('success', 'Employment record removed.');
    }
}
