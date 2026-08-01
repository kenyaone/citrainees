<?php

namespace App\Http\Controllers;

use App\Mail\DirectoryContactRelay;
use App\Models\Alumni;
use App\Models\CiCluster;
use App\Models\DirectoryMessage;
use App\Models\ProfileView;
use App\Models\Skill;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class DirectoryController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'skill' => ['nullable', 'string', 'max:100'],
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

        if (! empty($filters['skill'])) {
            // Free-text skill search — match any verified skill whose name
            // (or category) contains the query. Employers can type in-catalog
            // ("Web Design") or their own phrasing ("front end").
            $skillQ = $filters['skill'];
            $query->whereHas('skills', fn ($q) => $q
                ->whereNotNull('alumni_skill.verified_at')
                ->where(function ($sub) use ($skillQ) {
                    $sub->where('skills.name', 'like', "%{$skillQ}%")
                        ->orWhere('skills.category', 'like', "%{$skillQ}%");
                }));
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

        // Top 10 skills by count of alumni with a verified pivot — surfaces
        // the "hot" skills as quick-pick chips on the directory search bar.
        $topSkills = \Illuminate\Support\Facades\DB::table('alumni_skill')
            ->join('skills', 'skills.id', '=', 'alumni_skill.skill_id')
            ->join('alumni', 'alumni.id', '=', 'alumni_skill.alumni_id')
            ->whereNotNull('alumni_skill.verified_at')
            ->where('alumni.is_public', true)
            ->groupBy('skills.id', 'skills.name')
            ->orderByRaw('COUNT(*) DESC')
            ->limit(10)
            ->pluck('skills.name');

        return Inertia::render('directory/index', [
            'alumni' => $alumni,
            'filters' => $filters,
            'skills' => Skill::query()
                ->orderBy('category')
                ->orderBy('name')
                ->get(['id', 'name', 'category']),
            'top_skills' => $topSkills,
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
            'contact_relay_email' => Config::get('mail.contact_relay_address') ?? Config::get('mail.from.address'),
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

    public function sendMessage(Request $request, Alumni $alumni): RedirectResponse
    {
        abort_unless($alumni->is_public, 404);

        $data = $request->validate([
            'from_name' => ['required', 'string', 'max:100'],
            'from_email' => ['required', 'email', 'max:255'],
            'from_organisation' => ['nullable', 'string', 'max:150'],
            'purpose' => ['nullable', 'string', 'max:150'],
            'message' => ['required', 'string', 'min:20', 'max:2000'],
        ]);

        $contactMessage = DirectoryMessage::create([
            ...$data,
            'alumni_id' => $alumni->id,
            'ip_address' => $request->ip(),
        ]);

        ProfileView::query()
            ->where('alumni_id', $alumni->id)
            ->where('viewer_ip', $request->ip())
            ->latest()
            ->limit(1)
            ->update(['contact_attempted' => true]);

        $relayTo = Config::get('mail.contact_relay_address') ?? Config::get('mail.from.address');
        if ($relayTo && $this->mailIsConfigured()) {
            Mail::to($relayTo)->send(new DirectoryContactRelay($contactMessage, $alumni));
            $contactMessage->update(['relayed_at' => now()]);
        }

        return back()->with('directory_message_success', true);
    }

    private function mailIsConfigured(): bool
    {
        return ! empty(Config::get('mail.mailers.'.Config::get('mail.default').'.host'))
            && ! empty(Config::get('mail.from.address'));
    }
}
