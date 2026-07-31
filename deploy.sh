#!/usr/bin/env bash
# Deploy citrainees on cPanel (via cPanel Terminal).
# First-time setup is documented in DEPLOY.md; this script is for ongoing releases.
#
# Env vars:
#   SKIP_BUILD=1   Bypass npm entirely. Use when public/build/ was uploaded manually
#                  (built locally, zipped, extracted into public/build/). Shared cPanel
#                  hosting often can't fork enough processes for vite's Rolldown.
#   NODE_OPTIONS   Override memory limit. Default: --max-old-space-size=512
set -euo pipefail

cd "$(dirname "$0")"

# Source NVM if installed — shared cPanel hosts don't have node on the default PATH,
# and cron/non-interactive shells don't run ~/.bashrc where the NVM installer wires itself up.
if [ -s "$HOME/.nvm/nvm.sh" ]; then
    export NVM_DIR="$HOME/.nvm"
    # shellcheck disable=SC1091
    . "$NVM_DIR/nvm.sh"
fi

echo "→ Pulling latest from origin/main..."
git pull origin main

echo "→ Installing PHP dependencies (prod only)..."
composer install --no-dev --optimize-autoloader --no-interaction

if [ "${SKIP_BUILD:-0}" = "1" ]; then
    echo "→ Skipping frontend build (SKIP_BUILD=1). Assuming public/build/ was uploaded manually."
    if [ ! -f public/build/manifest.json ]; then
        echo "✗ Refusing to continue: public/build/manifest.json is missing. Upload build.zip and extract it before re-running."
        exit 1
    fi
else
    echo "→ Installing + building frontend..."
    npm ci --no-audit --no-fund
    # Cap Node memory so shared hosts don't OOM; user can override with NODE_OPTIONS env.
    export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=512}"
    npm run build
fi

echo "→ Running migrations..."
php artisan migrate --force

echo "→ Rebuilding config/route/view caches..."
php artisan config:clear
php artisan view:clear
php artisan route:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "→ Ensuring storage symlink exists..."
php artisan storage:link || true

echo "→ Signalling queue workers to restart with new code..."
php artisan queue:restart

echo "✓ Deploy complete: $(git rev-parse --short HEAD) at $(date -u +%FT%TZ)"
