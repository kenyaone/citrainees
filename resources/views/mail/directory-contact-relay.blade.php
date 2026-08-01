<x-mail::message>
# Habari {{ $alumniFirstName }},

**{{ $fromName }}**{{ $fromOrg ? ' from '.$fromOrg : '' }} found your profile on the CI Trainees directory and wants to reach you.

@if ($purpose)
**About:** {{ $purpose }}
@endif

---

{{ $body }}

---

To reply, just hit **Reply** in your email app — it goes directly to {{ $fromName }} at **{{ $fromEmail }}**.

If this looks like spam or a scam, ignore it. We never share your phone or personal email — only what you opted in to.

Karibu,
Compassion International Kenya
</x-mail::message>
