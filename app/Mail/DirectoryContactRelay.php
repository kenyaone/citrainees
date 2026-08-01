<?php

namespace App\Mail;

use App\Models\Alumni;
use App\Models\DirectoryMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DirectoryContactRelay extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public DirectoryMessage $contactMessage, public Alumni $alumni) {}

    public function envelope(): Envelope
    {
        $fromOrg = $this->contactMessage->from_organisation
            ? " ({$this->contactMessage->from_organisation})"
            : '';
        return new Envelope(
            subject: "New enquiry via CI Trainees — from {$this->contactMessage->from_name}{$fromOrg}",
            replyTo: [$this->contactMessage->from_email],
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.directory-contact-relay',
            with: [
                'alumniFirstName' => $this->alumni->first_name,
                'fromName' => $this->contactMessage->from_name,
                'fromEmail' => $this->contactMessage->from_email,
                'fromOrg' => $this->contactMessage->from_organisation,
                'purpose' => $this->contactMessage->purpose,
                'body' => $this->contactMessage->message,
            ],
        );
    }
}
