<?php

namespace App\Http\Controllers;

use App\Models\Alumni;
use App\Models\CiProject;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class JoinController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('join', [
            'projects' => CiProject::query()
                ->orderBy('name')
                ->get(['id', 'code', 'name', 'county']),
            'counties' => config('kenya_counties'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $countyKeys = array_keys(config('kenya_counties'));
        $currentYear = (int) date('Y');

        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'ci_project_id' => ['required', 'integer', 'exists:ci_projects,id'],
            'form_four_year' => ['required', 'integer', 'between:1990,'.$currentYear],
            'county' => ['required', 'string', Rule::in($countyKeys)],
            'phone_primary' => ['nullable', 'string', 'max:32'],
        ]);

        $user = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => trim("{$data['first_name']} {$data['last_name']}"),
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => User::ROLE_ALUMNI,
                'ci_project_id' => $data['ci_project_id'],
                'email_verified_at' => now(),
            ]);

            Alumni::create([
                'user_id' => $user->id,
                'ci_project_id' => $data['ci_project_id'],
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'form_four_year' => $data['form_four_year'],
                'county' => $data['county'],
                'phone_primary' => $data['phone_primary'] ?? null,
                'current_status' => 'unknown',
                'is_public' => false,
                'signup_completed_at' => now(),
            ]);

            return $user;
        });

        event(new Registered($user));
        Auth::login($user);

        return redirect('/my-profile')->with(
            'success',
            'Welcome! Fill out your profile below — add education, work history, skills, and certificates so CI staff can verify you.',
        );
    }
}
