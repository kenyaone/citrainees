# CI Trainees — Compassion International Kenya Alumni Tracer

Web platform that lets Compassion International Kenya track alumni after Form Four — the technical colleges, universities, and short courses they attended, and their employment path — while giving employers a searchable directory of CI-trained talent.

- **Live domain (planned):** https://tracer.ariseci.org
- **Repo:** https://github.com/kenyaone/citrainees
- **Stack:** Laravel 12 · Inertia · React · Tailwind · SQLite (dev) / MySQL (prod)
- **Hosting:** cPanel (subdomain of ariseci.org)

## Roadmap

### Phase 0 — Scoping & data model *(current)*
- CI Kenya sync: which project centres, alumni count, contact strategy
- Consent copy in English + Swahili
- ERD locked: `ci_projects`, `alumni`, `education_records`, `employment_records`, `skills`, `alumni_skill`, `consents`, `verifications`, `profile_views`

### Phase 1 — Staff-managed MVP
- CI staff auth + roles (admin, staff, alumni, employer)
- Alumni CRUD: bio, project, sponsorship years, Form Four year, KCSE index (encrypted)
- Post-secondary records: institution, level, course, start/end, completion, certificate upload
- Employment records: employer, role, sector, currently-employed toggle
- Skills tagging from a controlled vocabulary
- CSV bulk import for existing staff spreadsheets
- Dashboard: alumni by county, sector, employment rate, cohort year

### Phase 2 — Alumni self-service + verification
- Bulk invite by email/SMS (Africa's Talking)
- Alumni edit their own profile; consent capture on first login
- Staff verification queue before public changes go live
- Per-field visibility toggles

### Phase 3 — Public employer directory
- Public search: skill, county, availability, education level
- Only opted-in fields shown; contact routed through a form, not raw phone/email
- Rate-limit + reCAPTCHA against scrapers
- Every view + contact attempt logged and visible to the alumni
- "Report this contact" for the alumni

### Phase 4 — Reporting & polish
- CSV/PDF exports for donor reports
- Employment-rate dashboards by cohort, course, TVET vs. university
- PWA install for mobile

### Phase 5 — Later
- Native Android app if engagement warrants it
- Alumni mentorship matching, WhatsApp bot for profile updates

## Privacy defaults

Alumni skew young and many entered CI as vulnerable minors. Baked-in defaults:

- Every alumni field defaults to **private**; alumni opt each field to public individually
- PII columns (`phone_primary`, `email_secondary`, `kcse_index_number`) use Laravel's `encrypted` cast at rest
- Consent captured at first alumni login with versioned copy; revocation flow via `consents.revoked_at`
- Public directory hits are rate-limited and logged in `profile_views`
- Safeguarding lead at CI Kenya must sign off before public directory launches (Phase 3)

Formal Kenya DPA / ODPC registration is deferred to CI Kenya's compliance team; MVP ships with consent capture + encryption baked in.

## Local development

Requires [Laravel Herd](https://herd.laravel.com) (Windows/macOS) with PHP 8.4.

```bash
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
npm run dev
```

Herd auto-serves the app at `http://citrainees.test`.

## Deployment (cPanel)

Follows the same pattern as sibling projects:

- Git deploy via cPanel Terminal (`git pull` + `composer install --no-dev` + `npm run build` + `php artisan migrate --force`)
- Two cron jobs: queue worker (`php artisan queue:work`) and scheduler (`php artisan schedule:run` every minute)
- Point `tracer.ariseci.org` subdomain at the `public/` directory
- MySQL database provisioned via cPanel; update `.env` accordingly

## Contributing

This is a Compassion International Kenya project. External contributions require prior arrangement with the project owner.
