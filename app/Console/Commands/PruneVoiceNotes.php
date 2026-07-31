<?php

namespace App\Console\Commands;

use App\Models\SkillAssessmentAttempt;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class PruneVoiceNotes extends Command
{
    protected $signature = 'tracer:prune-voice-notes
                            {--days=30 : Delete voice files older than this many days past the staff decision}
                            {--dry-run : Report what would be deleted, do not delete}';

    protected $description = 'Delete voice-confirmation + video-submission recordings 30 days after a staff decision, per Kenya DPA minimisation. Runs daily via scheduler.';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $dryRun = (bool) $this->option('dry-run');
        $cutoff = now()->subDays($days);

        $voiceDeleted = $this->prune('voice_path', $cutoff, $dryRun, 'voice');
        $videoDeleted = $this->prune('video_path', $cutoff, $dryRun, 'video');

        $this->info(($dryRun ? 'Dry-run: ' : '').
            "Pruned {$voiceDeleted} voice files and {$videoDeleted} video files.");

        return self::SUCCESS;
    }

    private function prune(string $column, $cutoff, bool $dryRun, string $label): int
    {
        $attempts = SkillAssessmentAttempt::query()
            ->whereNotNull($column)
            ->whereNotNull('staff_reviewed_at')
            ->where('staff_reviewed_at', '<=', $cutoff)
            ->get(['id', $column, 'staff_reviewed_at']);

        if ($attempts->isEmpty()) {
            return 0;
        }

        $deleted = 0;
        foreach ($attempts as $attempt) {
            $path = $attempt->{$column};
            $exists = Storage::disk('local')->exists($path);
            if ($dryRun) {
                $this->line(($exists ? '[DELETE]' : '[MISSING]')." attempt #{$attempt->id} {$label} — reviewed {$attempt->staff_reviewed_at}");
                continue;
            }
            if ($exists) {
                Storage::disk('local')->delete($path);
                $deleted++;
            }
            $attempt->update([$column => null]);
        }

        return $deleted;
    }
}
