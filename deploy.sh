#!/usr/bin/env bash
# Deploy citrainees on cPanel (via cPanel Terminal).
# First-time setup is documented in DEPLOY.md; this script is for ongoing releases.
set -euo pipefail

cd "$(dirname "$0")"

echo "→ Pulling latest from origin/main..."
git pull origin main

echo "→ Installing PHP dependencies (prod only)..."
composer install --no-dev --optimize-autoloader --no-interaction

echo "→ Installing + building frontend..."
npm ci --no-audit --no-fund
npm run build

echo "→ Running migrations..."
php artisan migrate --force

echo "→ Rebuilding config/route/view caches..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "→ Ensuring storage symlink exists..."
php artisan storage:link || true

echo "→ Signalling queue workers to restart with new code..."
php artisan queue:restart

echo "✓ Deploy complete: $(git rev-parse --short HEAD) at $(date -u +%FT%TZ)"
