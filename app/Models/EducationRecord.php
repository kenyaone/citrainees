<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EducationRecord extends Model
{
    protected $fillable = [
        'alumni_id',
        'institution_name', 'institution_type',
        'course_name', 'level', 'specialization',
        'start_year', 'end_year', 'completion_status', 'grade_awarded',
        'certificate_path', 'is_public',
        'verified_at', 'verified_by',
    ];

    protected function casts(): array
    {
        return [
            'is_public' => 'boolean',
            'verified_at' => 'datetime',
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
