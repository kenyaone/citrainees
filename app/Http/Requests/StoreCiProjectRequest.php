<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCiProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isStaff() ?? false;
    }

    public function rules(): array
    {
        $projectId = $this->route('ci_project')?->id;

        return [
            'code' => ['required', 'string', 'max:32', Rule::unique('ci_projects', 'code')->ignore($projectId)],
            'name' => ['required', 'string', 'max:255'],
            'county' => ['nullable', 'string', 'max:64'],
            'sub_county' => ['nullable', 'string', 'max:64'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
