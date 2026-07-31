<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Alumni extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'alumni';

    protected $fillable = [
        'user_id', 'ci_project_id',
        'first_name', 'middle_name', 'last_name',
        'date_of_birth', 'gender', 'county', 'sub_county',
        'sponsorship_start_year', 'sponsorship_end_year', 'form_four_year',
        'kcse_index_number', 'kcse_mean_grade',
        'current_status', 'bio', 'preferred_language', 'profile_photo_path',
        'phone_primary', 'email_secondary',
        'is_public', 'field_visibility',
        'verified_at', 'verified_by',
        'signup_token', 'signup_token_expires_at', 'signup_completed_at',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'is_public' => 'boolean',
            'field_visibility' => 'array',
            'verified_at' => 'datetime',
            'signup_token_expires_at' => 'datetime',
            'signup_completed_at' => 'datetime',
            'kcse_index_number' => 'encrypted',
            'phone_primary' => 'encrypted',
            'email_secondary' => 'encrypted',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function ciProject()
    {
        return $this->belongsTo(CiProject::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function educationRecords()
    {
        return $this->hasMany(EducationRecord::class);
    }

    public function employmentRecords()
    {
        return $this->hasMany(EmploymentRecord::class);
    }

    public function skills()
    {
        return $this->belongsToMany(Skill::class)
            ->withPivot('proficiency', 'verified_at', 'verified_via', 'verified_by')
            ->withTimestamps();
    }

    public function consents()
    {
        return $this->hasMany(Consent::class);
    }

    public function profileViews()
    {
        return $this->hasMany(ProfileView::class);
    }

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->middle_name} {$this->last_name}");
    }
}
