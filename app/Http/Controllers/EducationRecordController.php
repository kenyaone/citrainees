<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEducationRecordRequest;
use App\Models\Alumni;
use App\Models\EducationRecord;
use Illuminate\Http\RedirectResponse;

class EducationRecordController extends Controller
{
    public function store(StoreEducationRecordRequest $request, Alumni $alumni): RedirectResponse
    {
        $alumni->educationRecords()->create($request->validated());

        return back()->with('success', 'Education record added.');
    }

    public function destroy(Alumni $alumni, EducationRecord $educationRecord): RedirectResponse
    {
        abort_unless($educationRecord->alumni_id === $alumni->id, 404);

        $educationRecord->delete();

        return back()->with('success', 'Education record removed.');
    }
}
