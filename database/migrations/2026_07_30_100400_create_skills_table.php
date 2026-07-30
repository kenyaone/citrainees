<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('skills', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 64)->unique();
            $table->string('name');
            $table->string('category', 64)->nullable();
            $table->timestamps();
        });

        Schema::create('alumni_skill', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumni_id')->constrained('alumni')->cascadeOnDelete();
            $table->foreignId('skill_id')->constrained('skills')->cascadeOnDelete();
            $table->string('proficiency', 16)->nullable();
            $table->timestamps();

            $table->unique(['alumni_id', 'skill_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alumni_skill');
        Schema::dropIfExists('skills');
    }
};
