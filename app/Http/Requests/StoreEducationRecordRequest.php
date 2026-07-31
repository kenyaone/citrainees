<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEducationRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Routes are already guarded by 'staff' or 'alumni' middleware.
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $currentYear = (int) date('Y');

        return [
            'institution_name' => ['required', 'string', 'max:255'],
            'institution_type' => ['required', 'in:tvet,university,college,vocational,short_course,other'],
            'course_name' => ['required', 'string', 'max:255'],
            'level' => ['required', 'in:certificate,diploma,higher_diploma,degree,masters,phd,short_course'],
            'specialization' => ['nullable', 'string', 'max:255'],
            'start_year' => ['nullable', 'integer', 'min:1980', 'max:'.($currentYear + 1)],
            'end_year' => ['nullable', 'integer', 'min:1980', 'max:'.($currentYear + 10)],
            'completion_status' => ['required', 'in:ongoing,completed,deferred,dropped_out'],
            'grade_awarded' => ['nullable', 'string', 'max:64'],
        ];
    }
}
