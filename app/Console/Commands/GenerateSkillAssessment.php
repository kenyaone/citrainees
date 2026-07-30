<?php

namespace App\Console\Commands;

use App\Models\Skill;
use App\Models\SkillAssessment;
use App\Services\AiQuizGenerator;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class GenerateSkillAssessment extends Command
{
    protected $signature = 'assessments:generate
                            {slug : The skill slug (e.g. digital-marketing, welding)}
                            {--publish : Mark the generated assessment active immediately (default: staged as inactive)}
                            {--overwrite : Replace an existing assessment for this skill}
                            {--count=10 : Number of questions to generate}';

    protected $description = 'Generate a draft skill assessment using Claude. Regulated skills are blocked. Drafts default to is_active=false so staff can review before publishing.';

    public function handle(AiQuizGenerator $generator): int
    {
        $slug = $this->argument('slug');
        $skill = Skill::where('slug', $slug)->first();

        if (! $skill) {
            $this->error("Skill '{$slug}' not found. Check `php artisan tinker` and query Skill::pluck('slug','name') for options.");
            return self::FAILURE;
        }

        $existing = SkillAssessment::where('skill_id', $skill->id)->first();
        if ($existing && ! $this->option('overwrite')) {
            $this->error("Assessment already exists for '{$skill->name}' (id={$existing->id}, active=".($existing->is_active ? 'yes' : 'no').").");
            $this->line('Re-run with --overwrite to replace it.');
            return self::FAILURE;
        }

        $count = (int) $this->option('count');
        $this->info("Generating {$count}-question quiz for '{$skill->name}' via Claude…");
        $this->line("Model: ".config('assessments.ai.model'));

        try {
            $drafts = $generator->generate($skill, $count);
        } catch (\Throwable $e) {
            $this->error($e->getMessage());
            return self::FAILURE;
        }

        $this->info(count($drafts).' questions returned. Preview:');
        foreach ($drafts as $i => $q) {
            $this->line('');
            $this->line(sprintf('  <fg=cyan>Q%d.</> %s', $i + 1, $q['question']));
            foreach ($q['options'] as $j => $opt) {
                $marker = $j === $q['correct_index'] ? '<fg=green>✓</>' : ' ';
                $this->line("    {$marker} ".chr(65 + $j).") {$opt}");
            }
            if (! empty($q['explanation'])) {
                $this->line("       <fg=gray>{$q['explanation']}</>");
            }
        }
        $this->line('');

        $assessment = DB::transaction(function () use ($skill, $drafts, $existing) {
            if ($existing) {
                $existing->questions()->delete();
                $existing->delete();
            }

            $a = SkillAssessment::create([
                'skill_id' => $skill->id,
                'title' => "{$skill->name} Assessment (AI-drafted)",
                'description' => "AI-generated quiz for {$skill->name}. Staff-reviewed drafts should have this description edited before publishing.",
                'pass_threshold' => config('assessments.default_pass_threshold'),
                'time_limit_minutes' => config('assessments.default_time_limit_minutes'),
                'is_active' => (bool) $this->option('publish'),
            ]);

            foreach ($drafts as $index => $draft) {
                $a->questions()->create([
                    'question_text' => $draft['question'],
                    'options' => $draft['options'],
                    'correct_index' => $draft['correct_index'],
                    'points' => 1,
                    'order_index' => $index,
                ]);
            }

            return $a;
        });

        $this->info("Saved assessment id={$assessment->id}, active=".($assessment->is_active ? 'YES' : 'no (draft)').'.');

        if (! $assessment->is_active) {
            $this->line('To publish once reviewed:');
            $this->line("  php artisan tinker --execute=\"App\\Models\\SkillAssessment::find({$assessment->id})->update(['is_active' => true]);\"");
        }

        return self::SUCCESS;
    }
}
