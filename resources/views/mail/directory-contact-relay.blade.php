<x-mail::message>
# Employer interest in {{ $alumniName }}

**{{ $fromName }}**{{ $fromOrg ? ' — '.$fromOrg : '' }} reached out about **{{ $alumniName }}** via the public alumni directory.

@if ($purpose)
**Purpose:** {{ $purpose }}
@endif

**Their email:** {{ $fromEmail }}
(Replying to this message will go directly to them.)

---

{{ $body }}

---

<x-mail::button :url="$alumniProfileUrl">
View alumnus profile
</x-mail::button>

Please introduce the employer to {{ $alumniName }} if the fit looks right, or reply directly to decline.

CI Trainees
</x-mail::message>
