<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('tracer:backup')
    ->dailyAt('02:00')
    ->timezone('Africa/Nairobi')
    ->onOneServer()
    ->runInBackground();

Schedule::command('tracer:prune-voice-notes')
    ->dailyAt('03:00')
    ->timezone('Africa/Nairobi')
    ->onOneServer();
