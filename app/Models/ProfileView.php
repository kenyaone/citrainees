<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfileView extends Model
{
    protected $fillable = [
        'alumni_id', 'viewer_user_id',
        'viewer_ip', 'viewer_country',
        'contact_attempted',
    ];

    protected function casts(): array
    {
        return [
            'contact_attempted' => 'boolean',
        ];
    }

    public function alumni()
    {
        return $this->belongsTo(Alumni::class);
    }

    public function viewer()
    {
        return $this->belongsTo(User::class, 'viewer_user_id');
    }
}
