<?php

namespace App\Http\Controllers;

use App\Models\CiProject;
use App\Models\InviteRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class InviteRequestController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'form_four_year' => ['nullable', 'integer', 'between:1990,'.(int) date('Y')],
            'ci_project_hint' => ['nullable', 'string', 'max:150'],
        ]);

        $projectId = null;
        if (! empty($data['ci_project_hint'])) {
            $projectId = CiProject::query()
                ->where('name', 'like', '%'.$data['ci_project_hint'].'%')
                ->value('id');
        }

        InviteRequest::create([
            ...$data,
            'ci_project_id' => $projectId,
            'ip_address' => $request->ip(),
            'status' => InviteRequest::STATUS_PENDING,
        ]);

        return back()->with('invite_request_success', true);
    }
}
