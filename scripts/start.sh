#!/bin/sh
# Production entrypoint for the OnGo Brain container.
# Applies pending Prisma migrations, optionally seeds, then boots the API.
# DATABASE_URL (and other secrets) come from the host's env, not a .env file.
set -e

cd /app/packages/db

echo "→ Applying database migrations…"
npx prisma migrate deploy

# One-time seed: set SEED_ON_START=true on the first deploy to create the
# founder + agents, then remove it. Never fails the boot if it errors.
if [ "$SEED_ON_START" = "true" ]; then
  echo "→ Seeding initial data…"
  npx tsx prisma/seed.ts || echo "seed skipped/failed (continuing)"
fi

cd /app
echo "→ Starting OnGo Brain…"
exec node apps/api/dist/main.js
