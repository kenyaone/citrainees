<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CiCluster extends Model
{
    protected $fillable = ['code', 'name', 'region', 'notes'];

    public function projects()
    {
        return $this->hasMany(CiProject::class);
    }

    public function alumni()
    {
        return $this->hasManyThrough(Alumni::class, CiProject::class);
    }
}
