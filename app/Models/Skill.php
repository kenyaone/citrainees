<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Skill extends Model
{
    protected $fillable = ['slug', 'name', 'category'];

    public function alumni()
    {
        return $this->belongsToMany(Alumni::class)->withPivot('proficiency')->withTimestamps();
    }
}
