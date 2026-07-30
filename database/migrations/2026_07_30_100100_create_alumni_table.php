<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alumni', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('ci_project_id')->nullable()->constrained('ci_projects')->nullOnDelete();

            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->date('date_of_birth')->nullable();
            $table->string('gender', 16)->nullable();
            $table->string('county')->nullable();
            $table->string('sub_county')->nullable();

            $table->year('sponsorship_start_year')->nullable();
            $table->year('sponsorship_end_year')->nullable();
            $table->year('form_four_year')->nullable();
            $table->text('kcse_index_number')->nullable();
            $table->string('kcse_mean_grade', 4)->nullable();

            $table->string('current_status', 32)->nullable();
            $table->text('bio')->nullable();
            $table->string('profile_photo_path')->nullable();

            $table->text('phone_primary')->nullable();
            $table->text('email_secondary')->nullable();

            $table->boolean('is_public')->default(false);
            $table->json('field_visibility')->nullable();

            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['ci_project_id', 'form_four_year']);
            $table->index('current_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alumni');
    }
};
