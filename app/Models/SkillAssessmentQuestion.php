<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SkillAssessmentQuestion extends Model
{
    protected $fillable = ['skill_assessment_id', 'question_text', 'options', 'correct_index', 'points', 'order_index'];

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'correct_index' => 'integer',
            'points' => 'integer',
            'order_index' => 'integer',
        ];
    }

    public function assessment()
    {
        return $this->belongsTo(SkillAssessment::class, 'skill_assessment_id');
    }
}
