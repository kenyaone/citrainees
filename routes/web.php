<?php

use App\Http\Controllers\AlumniController;
use App\Http\Controllers\AlumniImportController;
use App\Http\Controllers\AlumniInviteController;
use App\Http\Controllers\AlumniSelfController;
use App\Http\Controllers\CiProjectController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EducationRecordController;
use App\Http\Controllers\EmploymentRecordController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\SignupController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::get('signup/{token}', [SignupController::class, 'show'])->name('signup.show');
Route::post('signup/{token}', [SignupController::class, 'store'])->name('signup.store');

Route::middleware(['auth'])->group(function () {
    Route::get('home', HomeController::class)->name('home.redirect');
});

Route::middleware(['auth', 'verified', 'alumni'])->group(function () {
    Route::get('my-profile', [AlumniSelfController::class, 'edit'])->name('my-profile.edit');
    Route::patch('my-profile', [AlumniSelfController::class, 'update'])->name('my-profile.update');
    Route::post('my-profile/education', [AlumniSelfController::class, 'addEducation'])->name('my-profile.education.store');
    Route::post('my-profile/employment', [AlumniSelfController::class, 'addEmployment'])->name('my-profile.employment.store');
});

Route::middleware(['auth', 'verified', 'staff'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::get('alumni/import', [AlumniImportController::class, 'show'])->name('alumni.import.show');
    Route::get('alumni/import/template', [AlumniImportController::class, 'template'])->name('alumni.import.template');
    Route::post('alumni/import', [AlumniImportController::class, 'store'])->name('alumni.import.store');

    Route::get('alumni/{alumni}/invite', [AlumniInviteController::class, 'show'])->name('alumni.invite.show');
    Route::post('alumni/{alumni}/invite/regenerate', [AlumniInviteController::class, 'regenerate'])->name('alumni.invite.regenerate');
    Route::post('alumni/{alumni}/invite/email', [AlumniInviteController::class, 'email'])->name('alumni.invite.email');

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
