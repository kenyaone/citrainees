<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SkillVerificationRequest extends Model
{
    protected $fillable = [
        'alumni_id', 'skill_id',
        'method', 'evidence_path', 'evidence_original_name', 'alumni_notes',
        'status', 'reviewer_notes', 'reviewed_by', 'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
        ];
    }

    public function alumni()
    {
        return $this->belongsTo(Alumni::class);
    }

    public function skill()
    {
        return $this->belongsTo(Skill::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
