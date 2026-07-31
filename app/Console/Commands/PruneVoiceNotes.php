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

    protected $description = 'Delete voice-confirmation recordings 30 days after a staff decision, per Kenya DPA minimisation. Runs daily via scheduler.';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $dryRun = (bool) $this->option('dry-run');

        $cutoff = now()->subDays($days);

        $attempts = SkillAssessmentAttempt::query()
            ->whereNotNull('voice_path')
            ->whereNotNull('staff_reviewed_at')
            ->where('staff_reviewed_at', '<=', $cutoff)
            ->get(['id', 'voice_path', 'staff_reviewed_at']);

        if ($attempts->isEmpty()) {
            $this->info('No voice notes eligible for pruning.');
            return self::SUCCESS;
        }

        $deleted = 0;
        $missing = 0;
        foreach ($attempts as $attempt) {
            $exists = Storage::disk('local')->exists($attempt->voice_path);
            if ($dryRun) {
                $this->line(($exists ? '[DELETE]' : '[MISSING]')." attempt #{$attempt->id} — reviewed {$attempt->staff_reviewed_at}");
                continue;
            }
            if ($exists) {
                Storage::disk('local')->delete($attempt->voice_path);
                $deleted++;
            } else {
                $missing++;
            }
            $attempt->update(['voice_path' => null]);
        }

        $this->info(($dryRun ? 'Dry-run: ' : '').
            "Pruned {$deleted} voice files, cleared ".($deleted + $missing).' path references.');

        return self::SUCCESS;
    }
}
