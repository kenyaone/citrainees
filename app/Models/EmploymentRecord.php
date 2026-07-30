<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmploymentRecord extends Model
{
    protected $fillable = [
        'alumni_id',
        'employer_name', 'role_title', 'sector', 'employment_type', 'county',
        'start_date', 'end_date', 'is_current',
        'description', 'is_public',
        'verified_at', 'verified_by',
        'confirmation_token', 'confirmation_token_expires_at',
        'confirmed_at', 'confirmer_name', 'confirmer_email', 'confirmer_role',
        'confirmer_notes', 'confirmed_skill_ids',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'is_current' => 'boolean',
            'is_public' => 'boolean',
            'verified_at' => 'datetime',
            'confirmation_token_expires_at' => 'datetime',
            'confirmed_at' => 'datetime',
            'confirmed_skill_ids' => 'array',
        ];
    }

    public function alumni()
    {
        return $this->belongsTo(Alumni::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
