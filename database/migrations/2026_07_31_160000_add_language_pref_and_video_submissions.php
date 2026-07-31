<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('alumni', function (Blueprint $table) {
            // 'en' | 'sw' — used by PracticalTaskService to prompt Groq in the alumni's language
            $table->string('preferred_language', 4)->default('en')->after('bio');
        });

        Schema::table('skill_assessment_attempts', function (Blueprint $table) {
            // For type=video attempts. Storage disk 'local', path under video-submissions/{alumni_id}/.
            $table->string('video_path')->nullable()->after('voice_path');
            $table->timestamp('video_uploaded_at')->nullable()->after('video_path');
            // Optional short caption alumnus adds under the video (100 chars max).
            $table->string('submission_caption', 200)->nullable()->after('submission_text');
        });
    }

    public function down(): void
    {
        Schema::table('skill_assessment_attempts', function (Blueprint $table) {
            $table->dropColumn(['video_path', 'video_uploaded_at', 'submission_caption']);
        });

        Schema::table('alumni', function (Blueprint $table) {
            $table->dropColumn('preferred_language');
        });
    }
};
