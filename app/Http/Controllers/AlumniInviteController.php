<?php

namespace App\Http\Controllers;

use App\Mail\AlumniInvitation;
use App\Models\Alumni;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AlumniInviteController extends Controller
{
    private const TOKEN_TTL_DAYS = 30;

    public function show(Alumni $alumni): Response
    {
        if ($alumni->user_id) {
            abort(422, 'This alumnus already has an account.');
        }

        $this->ensureFreshToken($alumni);

        $signupUrl = url('/signup/'.$alumni->signup_token);
        $inviteMessage = $this->buildInviteMessage($alumni, $signupUrl);
        $waHref = 'https://wa.me/?text='.rawurlencode($inviteMessage);

        return Inertia::render('alumni/invite', [
            'alumni' => [
                'id' => $alumni->id,
                'first_name' => $alumni->first_name,
                'last_name' => $alumni->last_name,
                'email_secondary' => $alumni->email_secondary,
                'signup_token_expires_at' => $alumni->signup_token_expires_at?->toIso8601String(),
            ],
            'signup_url' => $signupUrl,
            'wa_href' => $waHref,
            'invite_message' => $inviteMessage,
            'mail_configured' => $this->mailIsConfigured(),
        ]);
    }

    public function regenerate(Alumni $alumni): RedirectResponse
    {
        if ($alumni->user_id) {
            abort(422, 'This alumnus already has an account.');
        }

        $alumni->update([
            'signup_token' => $this->generateToken(),
            'signup_token_expires_at' => now()->addDays(self::TOKEN_TTL_DAYS),
        ]);

        return back()->with('success', 'Fresh signup link generated.');
    }

    public function email(Alumni $alumni, Request $request): RedirectResponse
    {
        if ($alumni->user_id) {
            abort(422, 'This alumnus already has an account.');
        }

        $to = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ])['email'];

        $this->ensureFreshToken($alumni);
        $signupUrl = url('/signup/'.$alumni->signup_token);

        Mail::to($to)->send(new AlumniInvitation($alumni, $signupUrl));

        return back()->with('success', "Invitation emailed to {$to}.");
    }

    private function ensureFreshToken(Alumni $alumni): void
    {
        $needsNew = ! $alumni->signup_token
            || ! $alumni->signup_token_expires_at
            || $alumni->signup_token_expires_at->isPast();

        if ($needsNew) {
            $alumni->update([
                'signup_token' => $this->generateToken(),
                'signup_token_expires_at' => now()->addDays(self::TOKEN_TTL_DAYS),
            ]);
        }
    }

    private function generateToken(): string
    {
        return Str::random(48);
    }

    private function buildInviteMessage(Alumni $alumni, string $signupUrl): string
    {
        return "Habari {$alumni->first_name}! Compassion International Kenya is inviting you to join the alumni tracer platform. It helps us stay in touch and connects trainees with jobs.\n\nSet up your account here (link expires in 30 days):\n{$signupUrl}\n\nAsante!";
    }

    private function mailIsConfigured(): bool
    {
        $mailer = config('mail.default');

        if ($mailer === 'log' || $mailer === 'array') {
            return false;
        }

        if ($mailer === 'smtp') {
            return ! empty(config('mail.mailers.smtp.host')) && ! empty(config('mail.from.address'));
        }

        return true;
    }
}
