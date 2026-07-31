<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SkillAssessmentAttempt extends Model
{
    protected $fillable = [
        'alumni_id', 'skill_assessment_id',
        'started_at', 'submitted_at', 'duration_seconds',
        'score', 'max_score', 'passed', 'answers',
        'task_prompt', 'task_rubric', 'submission_text',
        'ai_feedback', 'ai_generated_flag',
        'voice_path', 'voice_uploaded_at',
        'video_path', 'video_uploaded_at',
        'submission_caption',
        'voided_at', 'voided_reason', 'tab_switches',
        'staff_reviewed_at', 'staff_reviewer_id', 'staff_decision',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'submitted_at' => 'datetime',
            'answers' => 'array',
            'task_rubric' => 'array',
            'ai_feedback' => 'array',
            'voice_uploaded_at' => 'datetime',
            'video_uploaded_at' => 'datetime',
            'voided_at' => 'datetime',
            'staff_reviewed_at' => 'datetime',
            'passed' => 'boolean',
            'score' => 'integer',
            'max_score' => 'integer',
            'duration_seconds' => 'integer',
            'tab_switches' => 'integer',
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

    public function staffReviewer()
    {
        return $this->belongsTo(User::class, 'staff_reviewer_id');
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
