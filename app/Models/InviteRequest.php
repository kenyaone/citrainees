<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InviteRequest extends Model
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_INVITED = 'invited';
    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'form_four_year',
        'ci_project_id',
        'ci_project_hint',
        'ip_address',
        'status',
        'handled_by',
        'handled_at',
        'staff_notes',
    ];

    protected function casts(): array
    {
        return [
            'handled_at' => 'datetime',
            'form_four_year' => 'integer',
        ];
    }

    public function ciProject(): BelongsTo
    {
        return $this->belongsTo(CiProject::class);
    }

    public function handler(): BelongsTo
    {
        return $this->belongsTo(User::class, 'handled_by');
    }
}
