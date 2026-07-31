<?php

namespace App\Console\Commands;

use App\Models\Alumni;
use App\Models\CiCluster;
use App\Models\CiProject;
use App\Models\EmploymentRecord;
use Database\Seeders\DemoDataSeeder;
use Illuminate\Console\Command;

class SeedDemoData extends Command
{
    protected $signature = 'tracer:seed-demo
                            {--force : Skip the "are you sure" prompt (needed in non-interactive shells)}';

    protected $description = 'Seed demo alumni, projects, clusters, education, employment, and verified skills. Safe to run on prod against an empty or lightly-populated tracer; refuses to run if there are already >5 alumni unless --force is passed.';

    public function handle(): int
    {
        $existingAlumni = Alumni::count();

        $this->info('Current state:');
        $this->line('  '.CiCluster::count().' CI clusters');
        $this->line('  '.CiProject::count().' CI projects');
        $this->line('  '.$existingAlumni.' alumni');
        $this->line('  '.EmploymentRecord::count().' employment records');
        $this->newLine();

        if ($existingAlumni > 5 && ! $this->option('force')) {
            $this->error(
                "You already have {$existingAlumni} alumni — running the demo seeder will add 50 more sample alumni ".
                'and may make real records harder to spot. Re-run with --force to proceed anyway.',
            );
            return self::FAILURE;
        }

        if (! $this->option('force') && ! $this->confirm('Seed demo data now?', true)) {
            $this->warn('Aborted.');
            return self::SUCCESS;
        }

        $this->info('Seeding demo data — this can take ~15 seconds on shared hosting…');

        (new DemoDataSeeder())->setContainer($this->laravel)->setCommand($this)->run();

        $this->newLine();
        $this->info('Done. New state:');
        $this->line('  '.CiCluster::count().' CI clusters');
        $this->line('  '.CiProject::count().' CI projects');
        $this->line('  '.Alumni::count().' alumni');
        $this->line('  '.Alumni::where('is_public', true)->count().' alumni opted in to public directory');
        $this->line('  '.EmploymentRecord::count().' employment records');

        return self::SUCCESS;
    }
}
