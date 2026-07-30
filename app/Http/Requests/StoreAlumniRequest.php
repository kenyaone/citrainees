<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAlumniRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isStaff() ?? false;
    }

    public function rules(): array
    {
        $currentYear = (int) date('Y');

        return [
            'ci_project_id' => ['nullable', 'exists:ci_projects,id'],
            'first_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'gender' => ['nullable', 'in:female,male,other,prefer_not_to_say'],
            'county' => ['nullable', 'string', 'max:64', 'in:'.implode(',', array_keys(config('kenya_counties')))],
            'sub_county' => ['nullable', 'string', 'max:64'],
            'sponsorship_start_year' => ['nullable', 'integer', 'min:1980', 'max:'.$currentYear],
            'sponsorship_end_year' => ['nullable', 'integer', 'min:1980', 'max:'.($currentYear + 5)],
            'form_four_year' => ['nullable', 'integer', 'min:1980', 'max:'.($currentYear + 5)],
            'kcse_index_number' => ['nullable', 'string', 'max:32'],
            'kcse_mean_grade' => ['nullable', 'string', 'max:4'],
            'current_status' => ['nullable', 'in:studying,employed,self_employed,unemployed,seeking,unknown'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'phone_primary' => ['nullable', 'string', 'max:32'],
            'email_secondary' => ['nullable', 'email', 'max:255'],
        ];
    }
}
