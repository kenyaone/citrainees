<?php

namespace App\Mail;

use App\Models\Alumni;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AlumniInvitation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Alumni $alumni, public string $signupUrl) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Join the Compassion International Kenya alumni platform',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.alumni-invitation',
            with: [
                'firstName' => $this->alumni->first_name,
                'signupUrl' => $this->signupUrl,
            ],
        );
    }
}
