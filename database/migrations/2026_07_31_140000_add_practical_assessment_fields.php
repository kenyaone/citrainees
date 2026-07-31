<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('skill_assessments', function (Blueprint $table) {
            $table->string('type', 16)->default('quiz')->after('skill_id');
        });

        Schema::table('skill_assessment_attempts', function (Blueprint $table) {
            $table->text('task_prompt')->nullable()->after('answers');
            $table->json('task_rubric')->nullable()->after('task_prompt');
            $table->text('submission_text')->nullable()->after('task_rubric');
            $table->json('ai_feedback')->nullable()->after('submission_text');
            $table->string('ai_generated_flag', 16)->nullable()->after('ai_feedback');
            $table->string('voice_path')->nullable()->after('ai_generated_flag');
            $table->timestamp('voice_uploaded_at')->nullable()->after('voice_path');
            $table->timestamp('voided_at')->nullable()->after('voice_uploaded_at');
            $table->string('voided_reason', 64)->nullable()->after('voided_at');
            $table->unsignedSmallInteger('tab_switches')->default(0)->after('voided_reason');
            $table->timestamp('staff_reviewed_at')->nullable()->after('tab_switches');
            $table->foreignId('staff_reviewer_id')->nullable()->after('staff_reviewed_at')->constrained('users')->nullOnDelete();
            $table->string('staff_decision', 16)->nullable()->after('staff_reviewer_id');

            $table->index(['staff_decision', 'staff_reviewed_at']);
        });
    }

    public function down(): void
    {
        Schema::table('skill_assessment_attempts', function (Blueprint $table) {
            $table->dropForeign(['staff_reviewer_id']);
            $table->dropIndex(['staff_decision', 'staff_reviewed_at']);
            $table->dropColumn([
                'task_prompt', 'task_rubric', 'submission_text',
                'ai_feedback', 'ai_generated_flag',
                'voice_path', 'voice_uploaded_at',
                'voided_at', 'voided_reason', 'tab_switches',
                'staff_reviewed_at', 'staff_reviewer_id', 'staff_decision',
            ]);
        });

        Schema::table('skill_assessments', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};
