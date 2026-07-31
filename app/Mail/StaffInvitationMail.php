<?php

namespace App\Mail;

use App\Models\StaffInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StaffInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public StaffInvitation $invitation, public string $signupUrl) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'You have been invited to join CI Trainees as staff',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.staff-invitation',
            with: [
                'name' => $this->invitation->name,
                'role' => $this->invitation->role,
                'signupUrl' => $this->signupUrl,
                'expiresAt' => $this->invitation->expires_at,
            ],
        );
    }
}
