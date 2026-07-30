<?php

use App\Http\Controllers\AlumniAssessmentController;
use App\Http\Controllers\AlumniController;
use App\Http\Controllers\AlumniImportController;
use App\Http\Controllers\AlumniInviteController;
use App\Http\Controllers\AlumniSelfController;
use App\Http\Controllers\CiClusterController;
use App\Http\Controllers\CiProjectController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EducationRecordController;
use App\Http\Controllers\EmploymentConfirmationController;
use App\Http\Controllers\EmploymentRecordController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\SignupController;
use App\Http\Controllers\SkillVerificationRequestController;
use App\Http\Controllers\VerificationController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', WelcomeController::class)->name('home');

Route::get('signup/{token}', [SignupController::class, 'show'])->name('signup.show');
Route::post('signup/{token}', [SignupController::class, 'store'])->middleware('throttle:public-token')->name('signup.store');

Route::get('confirm-employment/{token}', [EmploymentConfirmationController::class, 'show'])->name('employment-confirm.show');
Route::post('confirm-employment/{token}', [EmploymentConfirmationController::class, 'store'])->middleware('throttle:public-token')->name('employment-confirm.store');
Route::get('confirm-employment-thanks', [EmploymentConfirmationController::class, 'thanks'])->name('employment-confirm.thanks');

Route::middleware(['auth'])->group(function () {
    Route::get('home', HomeController::class)->name('home.redirect');
});

Route::middleware(['auth', 'verified', 'alumni'])->group(function () {
    Route::get('my-profile', [AlumniSelfController::class, 'edit'])->name('my-profile.edit');
    Route::patch('my-profile', [AlumniSelfController::class, 'update'])->name('my-profile.update');
    Route::post('my-profile/education', [AlumniSelfController::class, 'addEducation'])->name('my-profile.education.store');
    Route::post('my-profile/employment', [AlumniSelfController::class, 'addEmployment'])->name('my-profile.employment.store');
    Route::post('my-profile/employment/{employmentRecord}/issue-token', [EmploymentConfirmationController::class, 'issue'])->name('my-profile.employment.issue-token');
    Route::post('my-profile/employment/{employmentRecord}/regenerate-token', [EmploymentConfirmationController::class, 'regenerate'])->name('my-profile.employment.regenerate-token');

    Route::get('assessments', [AlumniAssessmentController::class, 'index'])->name('assessments.index');
    Route::post('assessments/{assessment}/start', [AlumniAssessmentController::class, 'start'])->name('assessments.start');
    Route::get('attempts/{attempt}/take', [AlumniAssessmentController::class, 'take'])->name('assessments.take');
    Route::post('attempts/{attempt}/submit', [AlumniAssessmentController::class, 'submit'])->name('assessments.submit');
    Route::get('attempts/{attempt}/result', [AlumniAssessmentController::class, 'result'])->name('assessments.result');

    Route::post('skill-certificates', [SkillVerificationRequestController::class, 'store'])->middleware('throttle:uploads')->name('skill-certificates.store');
});

Route::middleware(['auth', 'verified', 'staff'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::get('alumni/import', [AlumniImportController::class, 'show'])->name('alumni.import.show');
    Route::get('alumni/import/template', [AlumniImportController::class, 'template'])->name('alumni.import.template');
    Route::post('alumni/import', [AlumniImportController::class, 'store'])->middleware('throttle:csv-import')->name('alumni.import.store');

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
    Route::post('alumni/{alumni}/employment/{employmentRecord}/issue-token', [EmploymentConfirmationController::class, 'issue'])->name('alumni.employment.issue-token');
    Route::post('alumni/{alumni}/employment/{employmentRecord}/regenerate-token', [EmploymentConfirmationController::class, 'regenerate'])->name('alumni.employment.regenerate-token');

    Route::resource('ci-projects', CiProjectController::class)
        ->except(['create', 'show', 'edit'])
        ->parameters(['ci-projects' => 'ciProject']);

    Route::resource('ci-clusters', CiClusterController::class)
        ->except(['create', 'show', 'edit'])
        ->parameters(['ci-clusters' => 'ciCluster']);

    Route::get('verifications', [VerificationController::class, 'index'])->name('verifications.index');
    Route::post('verifications/{verification}/approve', [VerificationController::class, 'approve'])->name('verifications.approve');
    Route::post('verifications/{verification}/reject', [VerificationController::class, 'reject'])->name('verifications.reject');

    Route::post('skill-verifications/{skillVerification}/approve', [SkillVerificationRequestController::class, 'approve'])->name('skill-verifications.approve');
    Route::post('skill-verifications/{skillVerification}/reject', [SkillVerificationRequestController::class, 'reject'])->name('skill-verifications.reject');
    Route::delete('skill-verifications/{skillVerification}', [SkillVerificationRequestController::class, 'destroy'])->name('skill-verifications.destroy');
});

require __DIR__.'/settings.php';
