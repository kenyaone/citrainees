<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('education_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumni_id')->constrained('alumni')->cascadeOnDelete();

            $table->string('institution_name');
            $table->string('institution_type', 32);
            $table->string('course_name');
            $table->string('level', 32);
            $table->string('specialization')->nullable();

            $table->year('start_year')->nullable();
            $table->year('end_year')->nullable();
            $table->string('completion_status', 32)->default('ongoing');
            $table->string('grade_awarded')->nullable();

            $table->string('certificate_path')->nullable();
            $table->boolean('is_public')->default(true);

            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->index(['alumni_id', 'end_year']);
            $table->index('institution_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('education_records');
    }
};
