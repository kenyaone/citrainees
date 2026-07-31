<?php

namespace App\Http\Controllers;

use App\Models\StaffInvitation;
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

class StaffSignupController extends Controller
{
    public function show(string $token): Response|HttpResponse
    {
        $invitation = $this->findValidToken($token);

        if (! $invitation) {
            return Inertia::render('staff-signup-invalid');
        }

        if ($invitation->accepted_at) {
            return Inertia::render('staff-signup-invalid', ['reason' => 'already_used']);
        }

        return Inertia::render('staff-signup', [
            'invitation' => [
                'name' => $invitation->name,
                'email' => $invitation->email,
                'role' => $invitation->role,
            ],
            'token' => $token,
        ]);
    }

    public function store(Request $request, string $token): RedirectResponse
    {
        $invitation = $this->findValidToken($token);

        abort_if(! $invitation, 404, 'Invitation is invalid or expired.');
        abort_if((bool) $invitation->accepted_at, 422, 'This invitation has already been used.');

        $data = $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = DB::transaction(function () use ($invitation, $data) {
            $user = User::create([
                'name' => $invitation->name,
                'email' => $invitation->email,
                'password' => Hash::make($data['password']),
                'role' => $invitation->role,
                'email_verified_at' => now(),
            ]);

            $invitation->update([
                'accepted_at' => now(),
                'user_id' => $user->id,
            ]);

            return $user;
        });

        event(new Registered($user));
        Auth::login($user);

        return redirect('/dashboard')->with('success', 'Welcome to CI Trainees. Your staff account is ready.');
    }

    private function findValidToken(string $token): ?StaffInvitation
    {
        return StaffInvitation::where('token', $token)
            ->where('expires_at', '>=', now())
            ->first();
    }
}
