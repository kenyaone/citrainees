<?php

namespace App\Http\Requests;

class UpdateAlumniRequest extends StoreAlumniRequest
{
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'is_public' => ['sometimes', 'boolean'],
        ]);
    }
}
