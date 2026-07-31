<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employer_leads', function (Blueprint $table) {
            $table->id();
            $table->string('email');
            $table->string('organisation')->nullable();
            $table->string('hiring_for')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('notified_at')->nullable();
            $table->timestamps();
            $table->index('email');
        });

        Schema::create('invite_requests', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->unsignedSmallInteger('form_four_year')->nullable();
            $table->foreignId('ci_project_id')->nullable()->constrained('ci_projects')->nullOnDelete();
            $table->string('ci_project_hint')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->enum('status', ['pending', 'invited', 'rejected'])->default('pending');
            $table->foreignId('handled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('handled_at')->nullable();
            $table->text('staff_notes')->nullable();
            $table->timestamps();
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invite_requests');
        Schema::dropIfExists('employer_leads');
    }
};
