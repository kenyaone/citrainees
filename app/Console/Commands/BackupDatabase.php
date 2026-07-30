<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class BackupDatabase extends Command
{
    protected $signature = 'tracer:backup
                            {--keep=14 : How many backups to retain}
                            {--path=backups : Storage disk subdirectory}';

    protected $description = 'Dump the primary database, gzip it, and rotate the backups folder. Runs on the `local` disk under storage/app/private/backups/ by default.';

    public function handle(): int
    {
        $connection = config('database.default');
        $config = config("database.connections.{$connection}");
        $timestamp = now()->format('Y-m-d-His');
        $subdir = $this->option('path');
        $disk = Storage::disk('local');
        $disk->makeDirectory($subdir);

        try {
            $filename = match ($config['driver']) {
                'sqlite' => $this->backupSqlite($config, $subdir, $timestamp),
                'mysql', 'mariadb' => $this->backupMysql($config, $subdir, $timestamp),
                default => throw new RuntimeException("Unsupported DB driver for backup: {$config['driver']}"),
            };
        } catch (\Throwable $e) {
            $this->error("Backup failed: {$e->getMessage()}");
            return self::FAILURE;
        }

        $bytes = $disk->size("{$subdir}/{$filename}");
        $this->info("Backup written: storage/app/private/{$subdir}/{$filename} ({$this->formatBytes($bytes)})");

        $removed = $this->rotate($disk, $subdir, (int) $this->option('keep'));
        if ($removed > 0) {
            $this->line("Rotated {$removed} older backup(s).");
        }

        return self::SUCCESS;
    }

    private function backupSqlite(array $config, string $subdir, string $timestamp): string
    {
        $sourcePath = $config['database'];
        if (! is_file($sourcePath)) {
            throw new RuntimeException("SQLite file not found at {$sourcePath}");
        }

        $filename = "backup-sqlite-{$timestamp}.sqlite.gz";
        $target = Storage::disk('local')->path("{$subdir}/{$filename}");

        $data = file_get_contents($sourcePath);
        if ($data === false) {
            throw new RuntimeException("Could not read SQLite file at {$sourcePath}");
        }

        $gz = gzencode($data, 6);
        if ($gz === false || file_put_contents($target, $gz) === false) {
            throw new RuntimeException("Could not write gzipped SQLite backup to {$target}");
        }

        return $filename;
    }

    private function backupMysql(array $config, string $subdir, string $timestamp): string
    {
        $filename = "backup-mysql-{$timestamp}.sql.gz";
        $target = Storage::disk('local')->path("{$subdir}/{$filename}");
        $bin = env('MYSQLDUMP_PATH', 'mysqldump');

        $args = [
            $bin,
            '--single-transaction',
            '--quick',
            '--default-character-set=utf8mb4',
            '-h', $config['host'],
            '-P', (string) ($config['port'] ?? 3306),
            '-u', $config['username'],
            '--password='.$config['password'],
            $config['database'],
        ];

        $result = Process::run($args);
        if (! $result->successful()) {
            throw new RuntimeException("mysqldump failed: ".$result->errorOutput());
        }

        $gz = gzencode($result->output(), 6);
        if ($gz === false || file_put_contents($target, $gz) === false) {
            throw new RuntimeException("Could not write gzipped MySQL backup to {$target}");
        }

        return $filename;
    }

    private function rotate($disk, string $subdir, int $keep): int
    {
        $files = collect($disk->files($subdir))
            ->filter(fn ($f) => str_ends_with($f, '.gz'))
            ->sortByDesc(fn ($f) => $disk->lastModified($f))
            ->values();

        $toRemove = $files->slice($keep);
        foreach ($toRemove as $f) {
            $disk->delete($f);
        }
        return $toRemove->count();
    }

    private function formatBytes(int $bytes): string
    {
        if ($bytes < 1024) return "{$bytes} B";
        if ($bytes < 1024 * 1024) return round($bytes / 1024, 1)." KB";
        return round($bytes / 1024 / 1024, 2)." MB";
    }
}
