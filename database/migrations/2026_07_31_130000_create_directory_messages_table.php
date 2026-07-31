<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('directory_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumni_id')->constrained('alumni')->cascadeOnDelete();
            $table->string('from_name');
            $table->string('from_email');
            $table->string('from_organisation')->nullable();
            $table->string('purpose')->nullable();
            $table->text('message');
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('relayed_at')->nullable();
            $table->timestamps();
            $table->index(['alumni_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('directory_messages');
    }
};
