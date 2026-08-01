<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('staff_invitations', function (Blueprint $table) {
            // Kenyan mobile number in intl format (e.g. 254712345678) if the admin
            // wants WhatsApp links to open directly to the invitee's chat.
            $table->string('phone', 20)->nullable()->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('staff_invitations', function (Blueprint $table) {
            $table->dropColumn('phone');
        });
    }
};
