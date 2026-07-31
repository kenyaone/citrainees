<?php

namespace App\Http\Controllers;

use App\Mail\StaffInvitationMail;
use App\Models\StaffInvitation;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StaffController extends Controller
{
    private const TOKEN_TTL_DAYS = 30;

    public function index(): Response
    {
        return Inertia::render('staff/index', [
            'staff' => User::query()
                ->whereIn('role', [User::ROLE_ADMIN, User::ROLE_STAFF, User::ROLE_EMPLOYER])
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'role', 'created_at', 'email_verified_at']),
            'pending_invites' => StaffInvitation::query()
                ->whereNull('accepted_at')
                ->with('inviter:id,name')
                ->orderByDesc('created_at')
                ->get()
                ->map(fn ($i) => [
                    'id' => $i->id,
                    'email' => $i->email,
                    'name' => $i->name,
                    'role' => $i->role,
                    'expires_at' => $i->expires_at->toIso8601String(),
                    'expired' => $i->isExpired(),
                    'invited_by' => $i->inviter?->name,
                    'signup_url' => url('/staff-signup/'.$i->token),
                ]),
        ]);
    }

    public function invite(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'email' => [
                'required', 'email', 'max:255',
                Rule::unique('users', 'email'),
                Rule::unique('staff_invitations', 'email')->whereNull('accepted_at'),
            ],
            'name' => ['required', 'string', 'max:150'],
            'role' => ['required', 'in:staff,admin,employer'],
            'send_email' => ['sometimes', 'boolean'],
        ]);

        $invite = StaffInvitation::create([
            'email' => $data['email'],
            'name' => $data['name'],
            'role' => $data['role'],
            'invited_by' => $request->user()->id,
            'token' => Str::random(64),
            'expires_at' => now()->addDays(self::TOKEN_TTL_DAYS),
        ]);

        if (! empty($data['send_email']) && $this->mailIsConfigured()) {
            Mail::to($invite->email)->send(new StaffInvitationMail($invite, url('/staff-signup/'.$invite->token)));
            return redirect('/staff')->with('success', "Invitation created and emailed to {$invite->email}.");
        }

        return redirect('/staff')->with('success', 'Invitation created — copy the link and share it via WhatsApp, email, or SMS.');
    }

    public function resend(StaffInvitation $invitation): RedirectResponse
    {
        abort_unless($invitation->accepted_at === null, 422, 'Invitation already accepted.');

        if (! $this->mailIsConfigured()) {
            return back()->with('error', 'Mail is not configured on this server. Copy the signup link and share it manually.');
        }

        Mail::to($invitation->email)->send(new StaffInvitationMail(
            $invitation,
            url('/staff-signup/'.$invitation->token),
        ));

        return back()->with('success', "Invitation re-sent to {$invitation->email}.");
    }

    public function regenerate(StaffInvitation $invitation): RedirectResponse
    {
        abort_unless($invitation->accepted_at === null, 422, 'Invitation already accepted.');

        $invitation->update([
            'token' => Str::random(64),
            'expires_at' => now()->addDays(self::TOKEN_TTL_DAYS),
        ]);

        return back()->with('success', 'Fresh signup link generated.');
    }

    public function destroy(StaffInvitation $invitation): RedirectResponse
    {
        abort_unless($invitation->accepted_at === null, 422, 'Cannot revoke an accepted invitation.');

        $invitation->delete();

        return back()->with('success', 'Invitation revoked.');
    }

    private function mailIsConfigured(): bool
    {
        return ! empty(Config::get('mail.mailers.'.Config::get('mail.default').'.host'))
            && ! empty(Config::get('mail.from.address'));
    }
}
