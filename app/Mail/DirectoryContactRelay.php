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
        $name = "{$this->alumni->first_name} {$this->alumni->last_name}";
        return new Envelope(
            subject: "New employer interest in {$name}",
            replyTo: [$this->contactMessage->from_email],
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.directory-contact-relay',
            with: [
                'alumniName' => "{$this->alumni->first_name} {$this->alumni->last_name}",
                'alumniProfileUrl' => url('/directory/'.$this->alumni->id),
                'fromName' => $this->contactMessage->from_name,
                'fromEmail' => $this->contactMessage->from_email,
                'fromOrg' => $this->contactMessage->from_organisation,
                'purpose' => $this->contactMessage->purpose,
                'body' => $this->contactMessage->message,
            ],
        );
    }
}
