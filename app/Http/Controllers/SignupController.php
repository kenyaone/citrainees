<?php

namespace App\Http\Controllers;

use App\Models\Alumni;
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
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class SignupController extends Controller
{
    public function show(string $token): Response|HttpResponse
    {
        $alumni = $this->findValidToken($token);

        if (! $alumni) {
            return Inertia::render('signup-invalid');
        }

        if ($alumni->user_id) {
            return Inertia::render('signup-invalid', ['reason' => 'already_used']);
        }

        return Inertia::render('signup', [
            'alumni' => [
                'first_name' => $alumni->first_name,
                'last_name' => $alumni->last_name,
                'ci_project_name' => $alumni->ciProject?->name,
            ],
            'token' => $token,
        ]);
    }

    public function store(Request $request, string $token): RedirectResponse
    {
        $alumni = $this->findValidToken($token);

        abort_if(! $alumni, 404, 'Signup link is invalid or expired.');
        abort_if((bool) $alumni->user_id, 422, 'This link has already been used.');

        $data = $request->validate([
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = DB::transaction(function () use ($alumni, $data) {
            $user = User::create([
                'name' => trim("{$alumni->first_name} {$alumni->last_name}"),
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => User::ROLE_ALUMNI,
                'ci_project_id' => $alumni->ci_project_id,
                'email_verified_at' => now(),
            ]);

            $alumni->update([
                'user_id' => $user->id,
                'signup_completed_at' => now(),
                'signup_token' => null,
                'signup_token_expires_at' => null,
            ]);

            return $user;
        });

        event(new Registered($user));
        Auth::login($user);

        return redirect('/my-profile')->with('success', 'Welcome! Your account is ready.');
    }

    private function findValidToken(string $token): ?Alumni
    {
        return Alumni::where('signup_token', $token)
            ->where('signup_token_expires_at', '>=', now())
            ->with('ciProject:id,name')
            ->first();
    }
}
