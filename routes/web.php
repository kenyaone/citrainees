<?php

use App\Http\Controllers\AlumniController;
use App\Http\Controllers\CiProjectController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EducationRecordController;
use App\Http\Controllers\EmploymentRecordController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified', 'staff'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::resource('alumni', AlumniController::class)->parameters(['alumni' => 'alumni']);
    Route::post('alumni/{alumni}/verify', [AlumniController::class, 'verify'])->name('alumni.verify');

    Route::post('alumni/{alumni}/education', [EducationRecordController::class, 'store'])
        ->name('alumni.education.store');
    Route::delete('alumni/{alumni}/education/{educationRecord}', [EducationRecordController::class, 'destroy'])
        ->name('alumni.education.destroy');

    Route::post('alumni/{alumni}/employment', [EmploymentRecordController::class, 'store'])
        ->name('alumni.employment.store');
    Route::delete('alumni/{alumni}/employment/{employmentRecord}', [EmploymentRecordController::class, 'destroy'])
        ->name('alumni.employment.destroy');

    Route::resource('ci-projects', CiProjectController::class)
        ->except(['create', 'show', 'edit'])
        ->parameters(['ci-projects' => 'ciProject']);
});

require __DIR__.'/settings.php';
