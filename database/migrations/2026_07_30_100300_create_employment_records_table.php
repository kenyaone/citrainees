<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employment_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumni_id')->constrained('alumni')->cascadeOnDelete();

            $table->string('employer_name');
            $table->string('role_title');
            $table->string('sector', 64)->nullable();
            $table->string('employment_type', 32)->nullable();
            $table->string('county')->nullable();

            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->boolean('is_current')->default(false);

            $table->text('description')->nullable();
            $table->boolean('is_public')->default(true);

            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->index(['alumni_id', 'is_current']);
            $table->index('sector');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employment_records');
    }
};
