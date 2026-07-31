<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // For role=employer users: list of Skill.category strings they can competently
            // review (e.g. ['ICT & Software', 'Digital Marketing']). Used to filter the
            // /my-reviews queue to submissions they can actually judge.
            $table->json('reviewer_categories')->nullable()->after('ci_project_id');
            $table->string('organisation')->nullable()->after('reviewer_categories');
            $table->unsignedInteger('review_count')->default(0)->after('organisation');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['reviewer_categories', 'organisation', 'review_count']);
        });
    }
};
