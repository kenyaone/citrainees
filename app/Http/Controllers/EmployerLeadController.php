<?php

namespace App\Http\Controllers;

use App\Models\EmployerLead;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EmployerLeadController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'organisation' => ['nullable', 'string', 'max:150'],
            'hiring_for' => ['nullable', 'string', 'max:150'],
        ]);

        EmployerLead::create([
            ...$data,
            'ip_address' => $request->ip(),
        ]);

        return back()->with('employer_lead_success', true);
    }
}
