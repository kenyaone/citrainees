<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('skill_assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('skill_id')->constrained('skills')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedTinyInteger('pass_threshold')->default(70);
            $table->unsignedSmallInteger('time_limit_minutes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['skill_id', 'is_active']);
        });

        Schema::create('skill_assessment_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('skill_assessment_id')->constrained('skill_assessments')->cascadeOnDelete();
            $table->text('question_text');
            $table->json('options');
            $table->unsignedTinyInteger('correct_index');
            $table->unsignedTinyInteger('points')->default(1);
            $table->unsignedSmallInteger('order_index')->default(0);
            $table->timestamps();
        });

        Schema::create('skill_assessment_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumni_id')->constrained('alumni')->cascadeOnDelete();
            $table->foreignId('skill_assessment_id')->constrained('skill_assessments')->cascadeOnDelete();
            $table->timestamp('started_at');
            $table->timestamp('submitted_at')->nullable();
            $table->unsignedSmallInteger('duration_seconds')->nullable();
            $table->unsignedSmallInteger('score')->nullable();
            $table->unsignedSmallInteger('max_score')->nullable();
            $table->boolean('passed')->default(false);
            $table->json('answers')->nullable();
            $table->timestamps();

            $table->index(['alumni_id', 'skill_assessment_id']);
        });

        Schema::table('alumni_skill', function (Blueprint $table) {
            $table->timestamp('verified_at')->nullable()->after('proficiency');
            $table->string('verified_via', 32)->nullable()->after('verified_at');
            $table->unsignedBigInteger('verified_by')->nullable()->after('verified_via');
        });
    }

    public function down(): void
    {
        Schema::table('alumni_skill', function (Blueprint $table) {
            $table->dropColumn(['verified_at', 'verified_via', 'verified_by']);
        });
        Schema::dropIfExists('skill_assessment_attempts');
        Schema::dropIfExists('skill_assessment_questions');
        Schema::dropIfExists('skill_assessments');
    }
};
