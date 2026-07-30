# Deploying citrainees to tracer.ariseci.org

This document covers first-time cPanel setup and ongoing deploys.

## Prerequisites

- cPanel account with SSH / Terminal access
- PHP 8.2+ (8.3 or 8.4 recommended) selected in **Select PHP Version**
- MySQL database + user
- Node.js 20+ available on the shared host (or build assets locally + rsync `public/build/`)
- Git installed on the server (standard on cPanel)

## First-time setup

### 1. Create the subdomain

cPanel → **Domains** → **Create A New Domain**:

- Domain: `tracer.ariseci.org`
- Document root: `/home/<cpanel-user>/tracer_ariseci_org/public`

**Critical:** the doc root must end in `/public`. Laravel's `public/` folder is the only web-facing directory — pointing at the project root exposes `.env` and other secrets.

If cPanel restricts doc roots to under `public_html/`, either:
- Create the subdomain first (which auto-creates `public_html/tracer/`), then delete that folder and symlink it to `~/tracer_ariseci_org/public`, or
- Edit doc root manually to the absolute path via cPanel's **Domains → Manage → Document Root**.

### 2. Create the MySQL database

cPanel → **MySQL Databases**:

- Database: `<cpanel-user>_tracer`
- User: `<cpanel-user>_tracer` with a strong password
- Add user to database with **ALL PRIVILEGES**

Save the credentials — they go into `.env` in step 4.

### 3. Clone the repo

cPanel → **Terminal** (or SSH):

```bash
cd ~
git clone https://github.com/kenyaone/citrainees.git tracer_ariseci_org
cd tracer_ariseci_org
```

### 4. Configure `.env`

```bash
cp .env.example .env
nano .env
```

Set at minimum:

```
APP_NAME="CI Trainees Tracer"
APP_ENV=production
APP_KEY=                                   # will be generated below
APP_DEBUG=false
APP_URL=https://tracer.ariseci.org
APP_TIMEZONE=Africa/Nairobi
APP_LOCALE=en

LOG_CHANNEL=daily                          # rotating log per day
LOG_LEVEL=warning                          # info/debug are noisy in prod

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=<cpanel-user>_tracer
DB_USERNAME=<cpanel-user>_tracer
DB_PASSWORD=<strong-password>

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_SECURE_COOKIE=true

QUEUE_CONNECTION=database
CACHE_STORE=database

MAIL_MAILER=smtp                           # cPanel's SMTP server
MAIL_HOST=mail.ariseci.org
MAIL_PORT=465
MAIL_USERNAME=noreply@ariseci.org
MAIL_PASSWORD=<mailbox-password>
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS="noreply@ariseci.org"
MAIL_FROM_NAME="CI Trainees Tracer"

ANTHROPIC_API_KEY=                         # only needed if using AI quiz generator
ANTHROPIC_MODEL=claude-haiku-4-5

MYSQLDUMP_PATH=/usr/bin/mysqldump          # verify with `which mysqldump` on the server
```

Save and exit.

### 5. Install dependencies + build

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build

php artisan key:generate
php artisan migrate --force
php artisan db:seed --class=SkillSeeder --force
php artisan db:seed --class=SkillAssessmentSeeder --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 6. Create the initial admin

```bash
php artisan tinker --execute="App\Models\User::updateOrCreate(['email' => 'admin@ariseci.org'], ['name' => 'CI Admin', 'password' => bcrypt('<strong-password>'), 'role' => 'admin', 'email_verified_at' => now()]);"
```

### 7. File permissions

```bash
chmod -R 755 storage bootstrap/cache
find storage -type d -exec chmod 775 {} \;
find bootstrap/cache -type d -exec chmod 775 {} \;
```

### 8. Install the two crons

cPanel → **Cron Jobs**. Set your email so failures reach you.

**Queue worker** (every minute; short-lived to avoid hanging shared hosting):

```
* * * * * cd /home/<cpanel-user>/tracer_ariseci_org && /usr/bin/php artisan queue:work --stop-when-empty --max-time=50 >> storage/logs/queue.log 2>&1
```

**Scheduler** (every minute; triggers the daily backup and any future scheduled jobs):

```
* * * * * cd /home/<cpanel-user>/tracer_ariseci_org && /usr/bin/php artisan schedule:run >> storage/logs/schedule.log 2>&1
```

### 9. Enable HTTPS

cPanel → **SSL/TLS Status** → tick `tracer.ariseci.org` → **Run AutoSSL**. Let's Encrypt certificate provisions in a few minutes.

### 10. First smoke test

Open `https://tracer.ariseci.org/login`, log in as the admin, click through Dashboard → Alumni → CI projects → CI clusters → Verifications. All should render without error.

## Ongoing deploys

From your local machine, push changes to `origin/main` as usual. On the server:

```bash
cd ~/tracer_ariseci_org
bash deploy.sh
```

The script does: git pull → composer install (prod) → npm ci + build → migrate → cache rebuild → queue restart.

## Rate limits in effect

The app enforces these on public endpoints (see `app/Providers/AppServiceProvider.php`):

| Endpoint | Limit |
|---|---|
| `POST /signup/{token}` | 10/min per IP, 5/min per token |
| `POST /confirm-employment/{token}` | Same |
| `POST /skill-certificates` (alumnus file upload) | 20/hour per user |
| `POST /alumni/import` (staff CSV) | 5/hour per user |

Adjust in `AppServiceProvider::configureRateLimiting()` if legitimate traffic hits them.

## Backups

`php artisan tracer:backup` dumps the database and gzips it into `storage/app/private/backups/`. The scheduler runs it daily at 02:00 Africa/Nairobi. Backups older than 14 days are pruned automatically.

**To copy backups off-server**, add to your `crontab -e`:

```
30 2 * * * rsync -az /home/<cpanel-user>/tracer_ariseci_org/storage/app/private/backups/ user@backup-host:/backups/tracer/
```

Or manually via cPanel's **Backup** section.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| 500 error on every page | `.env` missing or `APP_KEY` blank | `php artisan key:generate && php artisan config:cache` |
| Storage links break after deploy | `public/storage` is a stale symlink | `rm public/storage && php artisan storage:link` |
| `route:cache` errors on deploy | A closure route was added | Remove the closure or drop the cache: `php artisan route:clear` |
| Queue jobs don't run | Cron not firing, or queue driver mismatch | Verify cron output in `storage/logs/queue.log`; confirm `QUEUE_CONNECTION=database` |
| Scheduled backup not appearing | Scheduler cron not installed | See step 8 above |
| Uploads fail silently | `storage/app/public/` not writable | `chmod -R 775 storage/app/public` |
| `mysqldump: command not found` in `tracer:backup` | Non-standard mysqldump path | Set `MYSQLDUMP_PATH=/usr/local/bin/mysqldump` (or wherever `which mysqldump` reports) in `.env` |
| `ext-sodium` composer error | Truehost / similar shared hosts missing extension | Enable via **Select PHP Version** → PHP Extensions, or `composer install --ignore-platform-req=ext-sodium` as a workaround |

## Recommended follow-ups after first launch

- Point **ariseci.org homepage** at `https://tracer.ariseci.org` from a "For Alumni" and "For Employers" call-to-action
- Set up an **error monitoring service** — [Sentry](https://sentry.io) has a free tier; `composer require sentry/sentry-laravel` then set `SENTRY_LARAVEL_DSN` in `.env`
- **Bounded log retention** — `LOG_CHANNEL=daily` keeps 14 days by default; adjust `days` in `config/logging.php` if disk is tight
- Add a **status page** — cPanel has uptime monitors; alternatively use free UptimeRobot pings on `https://tracer.ariseci.org/up` (Laravel's built-in health endpoint)
