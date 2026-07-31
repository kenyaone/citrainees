<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployerLead extends Model
{
    protected $fillable = [
        'email',
        'organisation',
        'hiring_for',
        'ip_address',
        'notified_at',
    ];

    protected function casts(): array
    {
        return [
            'notified_at' => 'datetime',
        ];
    }
}
