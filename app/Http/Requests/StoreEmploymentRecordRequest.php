<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmploymentRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isStaff() ?? false;
    }

    public function rules(): array
    {
        return [
            'employer_name' => ['required', 'string', 'max:255'],
            'role_title' => ['required', 'string', 'max:255'],
            'sector' => ['nullable', 'string', 'max:64'],
            'employment_type' => ['nullable', 'in:full_time,part_time,contract,internship,attachment,self_employed,volunteer'],
            'county' => ['nullable', 'string', 'max:64'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'is_current' => ['sometimes', 'boolean'],
            'description' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
