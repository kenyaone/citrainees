<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DirectoryMessage extends Model
{
    protected $fillable = [
        'alumni_id',
        'from_name', 'from_email', 'from_organisation',
        'purpose', 'message',
        'ip_address', 'relayed_at',
    ];

    protected function casts(): array
    {
        return [
            'relayed_at' => 'datetime',
        ];
    }

    public function alumni(): BelongsTo
    {
        return $this->belongsTo(Alumni::class);
    }
}
