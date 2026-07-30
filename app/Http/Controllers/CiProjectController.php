<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCiProjectRequest;
use App\Models\CiProject;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CiProjectController extends Controller
{
    public function index(): Response
    {
        $projects = CiProject::withCount('alumni')
            ->orderBy('name')
            ->get();

        return Inertia::render('ci-projects/index', [
            'projects' => $projects,
        ]);
    }

    public function store(StoreCiProjectRequest $request): RedirectResponse
    {
        CiProject::create($request->validated());

        return redirect()
            ->route('ci-projects.index')
            ->with('success', 'CI project added.');
    }

    public function update(StoreCiProjectRequest $request, CiProject $ciProject): RedirectResponse
    {
        $ciProject->update($request->validated());

        return redirect()
            ->route('ci-projects.index')
            ->with('success', 'CI project updated.');
    }

    public function destroy(CiProject $ciProject): RedirectResponse
    {
        if ($ciProject->alumni()->exists()) {
            return back()->with('error', 'Cannot delete a project that has alumni records.');
        }

        $ciProject->delete();

        return redirect()
            ->route('ci-projects.index')
            ->with('success', 'CI project removed.');
    }
}
