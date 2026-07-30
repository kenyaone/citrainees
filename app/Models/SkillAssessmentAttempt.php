<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SkillAssessmentAttempt extends Model
{
    protected $fillable = [
        'alumni_id', 'skill_assessment_id',
        'started_at', 'submitted_at', 'duration_seconds',
        'score', 'max_score', 'passed', 'answers',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'submitted_at' => 'datetime',
            'answers' => 'array',
            'passed' => 'boolean',
            'score' => 'integer',
            'max_score' => 'integer',
            'duration_seconds' => 'integer',
        ];
    }

    public function alumni()
    {
        return $this->belongsTo(Alumni::class);
    }

    public function assessment()
    {
        return $this->belongsTo(SkillAssessment::class, 'skill_assessment_id');
    }

    public function isActive(): bool
    {
        return $this->submitted_at === null;
    }

    public function scorePercent(): int
    {
        if (! $this->max_score) {
            return 0;
        }
        return (int) round(($this->score / $this->max_score) * 100);
    }
}
