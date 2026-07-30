<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAlumniRequest;
use App\Http\Requests\UpdateAlumniRequest;
use App\Models\Alumni;
use App\Models\CiProject;
use App\Models\Skill;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AlumniController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Alumni::query()
            ->with('ciProject:id,name,code')
            ->when($request->string('q')->toString(), function ($q, $search) {
                $q->where(function ($w) use ($search) {
                    $w->where('first_name', 'like', "%{$search}%")
                        ->orWhere('middle_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('county', 'like', "%{$search}%");
                });
            })
            ->when($request->integer('project_id'), fn ($q, $id) => $q->where('ci_project_id', $id))
            ->when($request->string('status')->toString(), fn ($q, $s) => $q->where('current_status', $s))
            ->when($request->integer('cohort'), fn ($q, $y) => $q->where('form_four_year', $y))
            ->when($request->string('county')->toString(), fn ($q, $c) => $q->where('county', $c))
            ->when($request->integer('skill_id'), fn ($q, $id) => $q->whereHas('skills', fn ($sq) => $sq->where('skills.id', $id)))
            ->orderByDesc('created_at');

        $alumni = $query->paginate(20)->withQueryString();
        $alumni->getCollection()->load('skills:id,name');

        return Inertia::render('alumni/index', [
            'alumni' => $alumni,
            'projects' => CiProject::orderBy('name')->get(['id', 'name', 'code']),
            'counties' => array_keys(config('kenya_counties')),
            'skills' => Skill::orderBy('name')->get(['id', 'name', 'category']),
            'filters' => $request->only(['q', 'project_id', 'status', 'cohort', 'county', 'skill_id']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('alumni/create', [
            'projects' => CiProject::orderBy('name')->get(['id', 'name', 'code']),
            'counties' => config('kenya_counties'),
            'skills' => Skill::orderBy('category')->orderBy('name')->get(['id', 'name', 'category']),
        ]);
    }

    public function store(StoreAlumniRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $skillIds = $validated['skill_ids'] ?? [];
        unset($validated['skill_ids']);

        $alumni = Alumni::create($validated);
        $alumni->skills()->sync($skillIds);

        return redirect()
            ->route('alumni.show', $alumni)
            ->with('success', 'Alumni record created.');
    }

    public function show(Alumni $alumni): Response
    {
        $alumni->load([
            'ciProject:id,name,code',
            'educationRecords' => fn ($q) => $q->orderByDesc('end_year')->orderByDesc('start_year'),
            'employmentRecords' => fn ($q) => $q->orderByDesc('is_current')->orderByDesc('start_date'),
            'skills:id,name,category',
            'verifier:id,name',
        ]);

        return Inertia::render('alumni/show', [
            'alumni' => $alumni,
        ]);
    }

    public function edit(Alumni $alumni): Response
    {
        $alumni->load('skills:id');

        return Inertia::render('alumni/edit', [
            'alumni' => $alumni,
            'projects' => CiProject::orderBy('name')->get(['id', 'name', 'code']),
            'counties' => config('kenya_counties'),
            'skills' => Skill::orderBy('category')->orderBy('name')->get(['id', 'name', 'category']),
        ]);
    }

    public function update(UpdateAlumniRequest $request, Alumni $alumni): RedirectResponse
    {
        $validated = $request->validated();
        $skillIds = $validated['skill_ids'] ?? null;
        unset($validated['skill_ids']);

        $alumni->update($validated);
        if ($skillIds !== null) {
            $alumni->skills()->sync($skillIds);
        }

        return redirect()
            ->route('alumni.show', $alumni)
            ->with('success', 'Alumni record updated.');
    }

    public function destroy(Alumni $alumni): RedirectResponse
    {
        $alumni->delete();

        return redirect()
            ->route('alumni.index')
            ->with('success', 'Alumni record archived.');
    }

    public function verify(Alumni $alumni, Request $request): RedirectResponse
    {
        $alumni->update([
            'verified_at' => now(),
            'verified_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Alumni record verified.');
    }
}
