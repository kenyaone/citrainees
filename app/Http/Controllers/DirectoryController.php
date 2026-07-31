<?php

namespace App\Http\Controllers;

use App\Models\Alumni;
use App\Models\CiCluster;
use App\Models\ProfileView;
use App\Models\Skill;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DirectoryController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'skill_id' => ['nullable', 'integer', 'exists:skills,id'],
            'county' => ['nullable', 'string', 'max:64'],
            'ci_cluster_id' => ['nullable', 'integer', 'exists:ci_clusters,id'],
            'year_from' => ['nullable', 'integer', 'between:1990,'.(int) date('Y')],
            'year_to' => ['nullable', 'integer', 'between:1990,'.(int) date('Y')],
        ]);

        $query = Alumni::query()
            ->where('is_public', true)
            ->whereHas('skills', fn ($q) => $q->whereNotNull('alumni_skill.verified_at'))
            ->with([
                'ciProject:id,name,county,ci_cluster_id',
                'ciProject.cluster:id,name,region',
                'skills' => fn ($q) => $q->whereNotNull('alumni_skill.verified_at')
                    ->select('skills.id', 'name', 'category'),
            ]);

        if (! empty($filters['q'])) {
            $q = $filters['q'];
            $query->where(function ($sub) use ($q) {
                $sub->where('first_name', 'like', "%{$q}%")
                    ->orWhere('last_name', 'like', "%{$q}%");
            });
        }
        if (! empty($filters['skill_id'])) {
            $query->whereHas('skills', fn ($q) => $q
                ->where('skills.id', $filters['skill_id'])
                ->whereNotNull('alumni_skill.verified_at'));
        }
        if (! empty($filters['county'])) {
            $query->where('county', $filters['county']);
        }
        if (! empty($filters['ci_cluster_id'])) {
            $query->whereHas('ciProject', fn ($q) => $q->where('ci_cluster_id', $filters['ci_cluster_id']));
        }
        if (! empty($filters['year_from'])) {
            $query->where('form_four_year', '>=', $filters['year_from']);
        }
        if (! empty($filters['year_to'])) {
            $query->where('form_four_year', '<=', $filters['year_to']);
        }

        $alumni = $query
            ->orderByDesc('verified_at')
            ->orderBy('last_name')
            ->paginate(24)
            ->withQueryString();

        return Inertia::render('directory/index', [
            'alumni' => $alumni,
            'filters' => $filters,
            'skills' => Skill::query()
                ->orderBy('category')
                ->orderBy('name')
                ->get(['id', 'name', 'category']),
            'clusters' => CiCluster::query()
                ->orderBy('name')
                ->get(['id', 'name', 'region']),
            'counties' => array_keys(config('kenya_counties')),
        ]);
    }

    public function show(Request $request, Alumni $alumni): Response
    {
        abort_unless($alumni->is_public, 404);
        abort_unless(
            $alumni->skills()->whereNotNull('alumni_skill.verified_at')->exists(),
            404,
        );

        ProfileView::create([
            'alumni_id' => $alumni->id,
            'viewer_user_id' => $request->user()?->id,
            'viewer_ip' => $request->ip(),
        ]);

        $alumni->load([
            'ciProject:id,name,county,ci_cluster_id',
            'ciProject.cluster:id,name,region',
            'educationRecords' => fn ($q) => $q->orderByDesc('end_year'),
            'employmentRecords' => fn ($q) => $q->orderByDesc('is_current')->orderByDesc('start_date'),
            'skills' => fn ($q) => $q->orderBy('name')->select('skills.id', 'name', 'category'),
        ]);

        $visibility = $alumni->field_visibility ?? [];
        $public = function (string $field) use ($visibility): bool {
            return ! empty($visibility[$field]);
        };

        return Inertia::render('directory/show', [
            'alumni' => [
                'id' => $alumni->id,
                'first_name' => $alumni->first_name,
                'last_name' => $alumni->last_name,
                'bio' => $alumni->bio,
                'county' => $alumni->county,
                'sub_county' => $alumni->sub_county,
                'form_four_year' => $alumni->form_four_year,
                'current_status' => $alumni->current_status,
                'verified_at' => $alumni->verified_at,
                'ci_project' => $alumni->ciProject ? [
                    'name' => $alumni->ciProject->name,
                    'county' => $alumni->ciProject->county,
                    'cluster' => $alumni->ciProject->cluster?->name,
                ] : null,
                'phone_primary' => $public('phone_primary') ? $alumni->phone_primary : null,
                'email_secondary' => $public('email_secondary') ? $alumni->email_secondary : null,
                'skills' => $alumni->skills->map(fn ($s) => [
                    'id' => $s->id,
                    'name' => $s->name,
                    'category' => $s->category,
                    'verified_at' => $s->pivot->verified_at,
                    'verified_via' => $s->pivot->verified_via,
                ]),
                'education_records' => $alumni->educationRecords->map(fn ($e) => [
                    'institution_name' => $e->institution_name,
                    'institution_type' => $e->institution_type,
                    'course_name' => $e->course_name,
                    'level' => $e->level,
                    'start_year' => $e->start_year,
                    'end_year' => $e->end_year,
                    'completion_status' => $e->completion_status,
                ]),
                'employment_records' => $alumni->employmentRecords
                    ->filter(fn ($r) => $r->confirmed_at !== null)
                    ->values()
                    ->map(fn ($r) => [
                        'employer_name' => $r->employer_name,
                        'role_title' => $r->role_title,
                        'sector' => $r->sector,
                        'employment_type' => $r->employment_type,
                        'start_date' => $r->start_date,
                        'end_date' => $r->end_date,
                        'is_current' => $r->is_current,
                        'confirmed_at' => $r->confirmed_at,
                    ]),
            ],
        ]);
    }
}
