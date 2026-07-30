<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ci_clusters', function (Blueprint $table) {
            $table->id();
            $table->string('code', 32)->unique();
            $table->string('name');
            $table->string('region')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::table('ci_projects', function (Blueprint $table) {
            $table->foreignId('ci_cluster_id')->nullable()->after('id')->constrained('ci_clusters')->nullOnDelete();
            $table->index('ci_cluster_id');
        });
    }

    public function down(): void
    {
        Schema::table('ci_projects', function (Blueprint $table) {
            $table->dropConstrainedForeignId('ci_cluster_id');
        });
        Schema::dropIfExists('ci_clusters');
    }
};
