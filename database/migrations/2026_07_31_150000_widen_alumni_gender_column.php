<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Original migration set gender as VARCHAR(16). The `prefer_not_to_say`
    // value we added on the /join and /my-profile forms is 17 characters,
    // which trips 1406 "Data too long" on MySQL. Widen to 32.
    public function up(): void
    {
        Schema::table('alumni', function (Blueprint $table) {
            $table->string('gender', 32)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('alumni', function (Blueprint $table) {
            $table->string('gender', 16)->nullable()->change();
        });
    }
};
