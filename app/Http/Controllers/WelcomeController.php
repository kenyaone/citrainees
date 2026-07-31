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
        return Inertia::render('welcome', [
            'stats' => [
                'alumni_count' => Alumni::count(),
                'verified_skill_count' => DB::table('alumni_skill')->whereNotNull('verified_at')->count(),
                'employer_confirmations' => EmploymentRecord::whereNotNull('confirmed_at')->count(),
                'projects_count' => CiProject::count(),
                'clusters_count' => CiCluster::count(),
                'skills_catalog_count' => Skill::count(),
            ],
            'public_alumni_count' => Alumni::query()
                ->where('is_public', true)
                ->whereHas('skills', fn ($q) => $q->whereNotNull('alumni_skill.verified_at'))
                ->count(),
        ]);
    }
}
