#!/usr/bin/env bash
# Extract a manually-uploaded public/build.zip and finish the deploy.
#
# Use this when the server-side `npm run build` in deploy.sh fails (shared cPanel
# hosting sometimes can't fork enough processes for vite's Rolldown backend).
#
# Workflow:
#   1. Locally: git pull && npm run build
#   2. Locally: cd public && powershell Compress-Archive -Path build -DestinationPath build.zip -Force
#   3. Upload build.zip via cPanel File Manager into /home/<user>/tracer_ariseci_org/public/
#   4. Server: bash deploy-assets.sh
set -euo pipefail

cd "$(dirname "$0")"

ZIP="public/build.zip"

if [ ! -f "$ZIP" ]; then
    echo "✗ $ZIP not found. Upload build.zip into public/ via File Manager first."
    exit 1
fi

echo "→ Pulling latest from origin/main..."
git pull origin main || echo "  (git pull failed — continuing with local state)"

echo "→ Installing PHP dependencies (prod only)..."
composer install --no-dev --optimize-autoloader --no-interaction

echo "→ Extracting uploaded assets..."
rm -rf public/build
# PowerShell's Compress-Archive uses backslash path separators, which makes
# `unzip` exit 1 (a warning, not an error). We ignore the exit code and
# verify success by checking manifest.json below.
unzip -qo "$ZIP" -d public/ || true
rm -f "$ZIP"

if [ ! -f public/build/manifest.json ]; then
    echo "✗ public/build/manifest.json missing after extract. Zip layout may be wrong."
    exit 1
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
