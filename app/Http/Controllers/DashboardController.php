<?php

namespace App\Http\Controllers;

use App\Models\Alumni;
use App\Models\CiProject;
use App\Models\EmploymentRecord;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $totalAlumni = Alumni::count();
        $verifiedAlumni = Alumni::whereNotNull('verified_at')->count();
        $currentlyEmployedAlumniIds = EmploymentRecord::where('is_current', true)->pluck('alumni_id')->unique();
        $employedCount = $currentlyEmployedAlumniIds->count();

        $employmentRate = $totalAlumni > 0
            ? round(($employedCount / $totalAlumni) * 100, 1)
            : 0.0;

        $byCounty = Alumni::select('county', DB::raw('count(*) as total'))
            ->whereNotNull('county')
            ->groupBy('county')
            ->orderByDesc('total')
            ->limit(10)
            ->get();

        $byCohort = Alumni::select('form_four_year', DB::raw('count(*) as total'))
            ->whereNotNull('form_four_year')
            ->groupBy('form_four_year')
            ->orderBy('form_four_year')
            ->get();

        $bySector = EmploymentRecord::select('sector', DB::raw('count(distinct alumni_id) as total'))
            ->where('is_current', true)
            ->whereNotNull('sector')
            ->groupBy('sector')
            ->orderByDesc('total')
            ->limit(10)
            ->get();

        $projectCount = CiProject::count();

        $recentAlumni = Alumni::with('ciProject:id,name')
            ->latest()
            ->limit(6)
            ->get(['id', 'first_name', 'last_name', 'ci_project_id', 'form_four_year', 'current_status', 'created_at']);

        return Inertia::render('dashboard', [
            'stats' => [
                'total_alumni' => $totalAlumni,
                'verified_alumni' => $verifiedAlumni,
                'employed_count' => $employedCount,
                'employment_rate' => $employmentRate,
                'project_count' => $projectCount,
            ],
            'by_county' => $byCounty,
            'by_cohort' => $byCohort,
            'by_sector' => $bySector,
            'recent_alumni' => $recentAlumni,
        ]);
    }
}
