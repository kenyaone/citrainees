<x-mail::message>
# Hello {{ $name }},

You have been invited to join the CI Trainees platform as a **{{ ucfirst($role) }}** member of the Compassion International Kenya team.

CI Trainees helps CI Kenya stay in touch with alumni after Form Four, verify their skills, and connect them with employers.

Set up your account using the button below — the link expires on {{ $expiresAt->format('d M Y') }}.

<x-mail::button :url="$signupUrl">
Accept invitation
</x-mail::button>

If the button doesn't work, copy this link into your browser:

{{ $signupUrl }}

Karibu,
Compassion International Kenya
</x-mail::message>
