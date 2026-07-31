<?php

namespace Database\Seeders;

use App\Models\Alumni;
use App\Models\CiCluster;
use App\Models\CiProject;
use App\Models\EmploymentRecord;
use App\Models\Skill;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DemoDataSeeder extends Seeder
{
    private const CLUSTERS = [
        ['code' => 'NAI-01', 'name' => 'Nairobi Cluster', 'region' => 'Nairobi'],
        ['code' => 'CEN-01', 'name' => 'Central Cluster', 'region' => 'Central'],
        ['code' => 'RIF-01', 'name' => 'Rift Valley Cluster', 'region' => 'Rift Valley'],
        ['code' => 'NYA-01', 'name' => 'Nyanza Cluster', 'region' => 'Nyanza'],
        ['code' => 'WES-01', 'name' => 'Western Cluster', 'region' => 'Western'],
        ['code' => 'COA-01', 'name' => 'Coast Cluster', 'region' => 'Coast'],
        ['code' => 'EAS-01', 'name' => 'Eastern Cluster', 'region' => 'Eastern'],
    ];

    private const PROJECTS = [
        // code, cluster_code, name, county, sub_county
        ['KE-0421', 'NAI-01', 'Kibera Hope Centre', 'Nairobi', 'Kibra'],
        ['KE-0422', 'NAI-01', 'Kasarani Youth Project', 'Nairobi', 'Kasarani'],
        ['KE-0501', 'CEN-01', 'Kiambu Grace Project', 'Kiambu', 'Kiambaa'],
        ['KE-0502', 'CEN-01', 'Nyeri Central Project', 'Nyeri', 'Nyeri Town'],
        ['KE-0601', 'RIF-01', 'Nakuru Bahati Project', 'Nakuru', 'Bahati'],
        ['KE-0602', 'RIF-01', 'Eldoret Community Project', 'Uasin Gishu', 'Soy'],
        ['KE-0603', 'RIF-01', 'Kericho Tea Belt Project', 'Kericho', 'Ainamoi'],
        ['KE-0701', 'NYA-01', 'Kisumu East Project', 'Kisumu', 'Kisumu East'],
        ['KE-0702', 'NYA-01', 'Kisii Highlands Project', 'Kisii', 'Bonchari'],
        ['KE-0801', 'WES-01', 'Kakamega West Project', 'Kakamega', 'Malava'],
        ['KE-0802', 'WES-01', 'Bungoma Mt. Elgon Project', 'Bungoma', 'Mt. Elgon'],
        ['KE-0901', 'COA-01', 'Mombasa Kisauni Project', 'Mombasa', 'Kisauni'],
        ['KE-0902', 'COA-01', 'Kilifi Malindi Project', 'Kilifi', 'Malindi'],
        ['KE-1001', 'EAS-01', 'Machakos Yatta Project', 'Machakos', 'Yatta'],
        ['KE-1002', 'EAS-01', 'Meru Igembe Project', 'Meru', 'Igembe South'],
    ];

    private const INSTITUTIONS = [
        ['name' => 'Kenya Technical Training College', 'type' => 'tvet'],
        ['name' => 'Nyeri National Polytechnic', 'type' => 'tvet'],
        ['name' => 'Kisumu Polytechnic', 'type' => 'tvet'],
        ['name' => 'Mombasa Technical Training Institute', 'type' => 'tvet'],
        ['name' => 'Rift Valley Technical Training Institute', 'type' => 'tvet'],
        ['name' => 'Kenyatta University', 'type' => 'university'],
        ['name' => 'University of Nairobi', 'type' => 'university'],
        ['name' => 'Moi University', 'type' => 'university'],
        ['name' => 'Egerton University', 'type' => 'university'],
        ['name' => 'Maseno University', 'type' => 'university'],
        ['name' => 'Nakuru Technical College', 'type' => 'college'],
        ['name' => 'Kabete National Polytechnic', 'type' => 'tvet'],
    ];

    private const EMPLOYERS = [
        ['name' => 'Safaricom PLC', 'sector' => 'Telecommunications'],
        ['name' => 'Equity Bank Kenya', 'sector' => 'Banking'],
        ['name' => 'Kenya Airways', 'sector' => 'Aviation'],
        ['name' => 'Twiga Foods', 'sector' => 'Agriculture'],
        ['name' => 'Sokowatch', 'sector' => 'Retail'],
        ['name' => 'M-KOPA Solar', 'sector' => 'Energy'],
        ['name' => 'Nairobi Water Company', 'sector' => 'Utilities'],
        ['name' => 'Kenya Red Cross', 'sector' => 'Non-profit'],
        ['name' => 'AAR Healthcare', 'sector' => 'Healthcare'],
        ['name' => 'Bidco Africa', 'sector' => 'Manufacturing'],
        ['name' => 'Nakumatt Holdings', 'sector' => 'Retail'],
        ['name' => 'Freelance', 'sector' => 'Freelance'],
        ['name' => 'Self-employed', 'sector' => 'Self-employed'],
    ];

    public function run(): void
    {
        // 0. Ensure prerequisite catalog data
        if (Skill::count() === 0) {
            $this->call(SkillSeeder::class);
        }

        // 1. Clusters
        $clusterMap = [];
        foreach (self::CLUSTERS as $c) {
            $cluster = CiCluster::updateOrCreate(['code' => $c['code']], $c);
            $clusterMap[$c['code']] = $cluster;
        }

        // 2. Projects
        $projects = collect();
        foreach (self::PROJECTS as [$code, $clusterCode, $name, $county, $subCounty]) {
            $project = CiProject::updateOrCreate(
                ['code' => $code],
                [
                    'ci_cluster_id' => $clusterMap[$clusterCode]->id,
                    'name' => $name,
                    'county' => $county,
                    'sub_county' => $subCounty,
                ],
            );
            $projects->push($project);
        }

        // 3. Alumni — 50, spread across projects
        $skills = Skill::all();
        $alumni = collect();

        for ($i = 0; $i < 50; $i++) {
            $project = $projects->random();
            $isPublic = rand(1, 100) <= 80;
            $isStaffVerified = rand(1, 100) <= 60;
            $person = Alumni::factory()->create([
                'ci_project_id' => $project->id,
                'is_public' => $isPublic,
                'verified_at' => $isStaffVerified ? now()->subDays(rand(1, 60)) : null,
                'field_visibility' => $isPublic
                    ? [
                        'phone_primary' => rand(1, 100) <= 40,
                        'email_secondary' => rand(1, 100) <= 40,
                    ]
                    : null,
            ]);
            $alumni->push($person);
        }

        // 4. Skills attach: 3-6 per alumnus, some verified via each path
        foreach ($alumni as $person) {
            $picked = $skills->random(rand(3, 6));
            $syncData = [];
            foreach ($picked as $skill) {
                $method = collect(['quiz', 'certificate', 'employer', null, null])->random();
                $syncData[$skill->id] = [
                    'proficiency' => null,
                    'verified_at' => $method ? now()->subDays(rand(1, 200)) : null,
                    'verified_via' => $method,
                    'verified_by' => null,
                ];
            }
            $person->skills()->sync($syncData);
        }

        // 5. Education records — 1-2 per alumnus
        foreach ($alumni as $person) {
            $count = rand(1, 2);
            for ($i = 0; $i < $count; $i++) {
                $inst = collect(self::INSTITUTIONS)->random();
                $start = ($person->form_four_year ?? 2018) + rand(1, 2);
                $person->educationRecords()->create([
                    'institution_name' => $inst['name'],
                    'institution_type' => $inst['type'],
                    'course_name' => collect([
                        'Computer Science', 'Business Administration', 'Nursing',
                        'Electrical Installation', 'Web Design', 'Accounting',
                        'Motor Vehicle Mechanics', 'Community Health', 'Journalism',
                        'Culinary Arts', 'Welding & Fabrication', 'Digital Marketing',
                    ])->random(),
                    'level' => $inst['type'] === 'university'
                        ? collect(['degree', 'higher_diploma'])->random()
                        : collect(['certificate', 'diploma'])->random(),
                    'start_year' => $start,
                    'end_year' => $start + rand(1, 4),
                    'completion_status' => collect(['completed', 'completed', 'completed', 'ongoing'])->random(),
                ]);
            }
        }

        // 6. Employment records — 60% of alumni have at least one, some confirmed
        foreach ($alumni as $person) {
            if (rand(1, 100) > 60) continue;

            $count = rand(1, 2);
            for ($i = 0; $i < $count; $i++) {
                $emp = collect(self::EMPLOYERS)->random();
                $isCurrent = $i === 0 && rand(1, 100) <= 70;
                $startDate = now()->subMonths(rand(6, 60));
                $confirmed = rand(1, 100) <= 30;

                $person->employmentRecords()->create([
                    'employer_name' => $emp['name'],
                    'role_title' => collect([
                        'Software Developer', 'Sales Executive', 'Nurse',
                        'Electrician', 'Marketing Assistant', 'Accountant',
                        'Mechanic', 'Community Health Worker', 'Content Writer',
                        'Chef', 'Welder', 'Digital Marketer', 'Customer Care Agent',
                    ])->random(),
                    'sector' => $emp['sector'],
                    'employment_type' => collect(['full_time', 'full_time', 'contract', 'self_employed'])->random(),
                    'county' => $person->county,
                    'start_date' => $startDate,
                    'end_date' => $isCurrent ? null : $startDate->copy()->addMonths(rand(6, 24)),
                    'is_current' => $isCurrent,
                    'verified_at' => $confirmed ? now()->subDays(rand(1, 90)) : null,
                    'confirmed_at' => $confirmed ? now()->subDays(rand(1, 90)) : null,
                    'confirmer_name' => $confirmed ? collect(['HR Manager', 'Operations Lead', 'Director', 'CEO'])->random().' — sample' : null,
                    'confirmer_email' => $confirmed ? 'hr@'.strtolower(str_replace([' ', '.'], '', $emp['name'])).'.co.ke' : null,
                    'confirmer_role' => $confirmed ? collect(['HR Manager', 'Operations Lead', 'Team Lead'])->random() : null,
                ]);
            }
        }

        $this->command->info('Seeded '.count(self::CLUSTERS).' clusters');
        $this->command->info('Seeded '.count(self::PROJECTS).' CI projects');
        $this->command->info('Seeded '.$alumni->count().' alumni with skills, education, and employment records');
    }
}
