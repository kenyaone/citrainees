<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('skill_verification_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumni_id')->constrained('alumni')->cascadeOnDelete();
            $table->foreignId('skill_id')->constrained('skills')->cascadeOnDelete();
            $table->string('method', 32);
            $table->string('evidence_path')->nullable();
            $table->string('evidence_original_name')->nullable();
            $table->text('alumni_notes')->nullable();
            $table->string('status', 16)->default('pending');
            $table->text('reviewer_notes')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index(['alumni_id', 'skill_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('skill_verification_requests');
    }
};
