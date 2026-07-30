<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('alumni', function (Blueprint $table) {
            $table->string('signup_token', 64)->nullable()->unique()->after('email_secondary');
            $table->timestamp('signup_token_expires_at')->nullable()->after('signup_token');
            $table->timestamp('signup_completed_at')->nullable()->after('signup_token_expires_at');
        });
    }

    public function down(): void
    {
        Schema::table('alumni', function (Blueprint $table) {
            $table->dropUnique(['signup_token']);
            $table->dropColumn(['signup_token', 'signup_token_expires_at', 'signup_completed_at']);
        });
    }
};
