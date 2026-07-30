<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CiProject extends Model
{
    protected $table = 'ci_projects';

    protected $fillable = ['code', 'name', 'county', 'sub_county', 'notes'];

    public function alumni()
    {
        return $this->hasMany(Alumni::class);
    }

    public function staff()
    {
        return $this->hasMany(User::class);
    }
}
