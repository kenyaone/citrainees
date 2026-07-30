<x-mail::message>
# Habari {{ $firstName }},

Compassion International Kenya has invited you to join the alumni tracer platform.
It helps CI stay in touch with you after Form Four, and connects trainees like you
with employers looking for your skills.

Set up your account using the button below — the link expires in 30 days.

<x-mail::button :url="$signupUrl">
Set up my account
</x-mail::button>

If the button doesn't work, copy this link into your browser:

{{ $signupUrl }}

Asante,
Compassion International Kenya
</x-mail::message>
