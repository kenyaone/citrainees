<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employment_records', function (Blueprint $table) {
            $table->string('confirmation_token', 64)->nullable()->unique()->after('is_public');
            $table->timestamp('confirmation_token_expires_at')->nullable()->after('confirmation_token');
            $table->timestamp('confirmed_at')->nullable()->after('confirmation_token_expires_at');
            $table->string('confirmer_name')->nullable()->after('confirmed_at');
            $table->string('confirmer_email')->nullable()->after('confirmer_name');
            $table->string('confirmer_role')->nullable()->after('confirmer_email');
            $table->text('confirmer_notes')->nullable()->after('confirmer_role');
            $table->json('confirmed_skill_ids')->nullable()->after('confirmer_notes');
        });
    }

    public function down(): void
    {
        Schema::table('employment_records', function (Blueprint $table) {
            $table->dropUnique(['confirmation_token']);
            $table->dropColumn([
                'confirmation_token', 'confirmation_token_expires_at', 'confirmed_at',
                'confirmer_name', 'confirmer_email', 'confirmer_role', 'confirmer_notes',
                'confirmed_skill_ids',
            ]);
        });
    }
};
