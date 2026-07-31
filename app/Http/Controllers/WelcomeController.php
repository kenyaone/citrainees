<?php

namespace App\Http\Controllers;

use App\Models\Alumni;
use App\Models\CiCluster;
use App\Models\CiProject;
use App\Models\EmploymentRecord;
use App\Models\Skill;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class WelcomeController extends Controller
{
    public function __invoke(): Response
    {
        $verifiedSkillCount = DB::table('alumni_skill')->whereNotNull('verified_at')->count();

        $alumniByCounty = Alumni::query()
            ->whereNotNull('county')
            ->selectRaw('county, count(*) as total')
            ->groupBy('county')
            ->pluck('total', 'county')
            ->all();

        return Inertia::render('welcome', [
            'stats' => [
                'alumni_count' => Alumni::count(),
                'verified_skill_count' => $verifiedSkillCount,
                'employer_confirmations' => EmploymentRecord::whereNotNull('confirmed_at')->count(),
                'projects_count' => CiProject::count(),
                'clusters_count' => CiCluster::count(),
                'skills_catalog_count' => Skill::count(),
            ],
            'alumni_by_county' => $alumniByCounty,
        ]);
    }
}
