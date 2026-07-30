<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SkillAssessment extends Model
{
    protected $fillable = ['skill_id', 'title', 'description', 'pass_threshold', 'time_limit_minutes', 'is_active'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'pass_threshold' => 'integer',
            'time_limit_minutes' => 'integer',
        ];
    }

    public function skill()
    {
        return $this->belongsTo(Skill::class);
    }

    public function questions()
    {
        return $this->hasMany(SkillAssessmentQuestion::class)->orderBy('order_index');
    }

    public function attempts()
    {
        return $this->hasMany(SkillAssessmentAttempt::class);
    }
}
