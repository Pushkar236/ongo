# ─────────────────────────────────────────────────────────────────────────
# OnGo Brain (apps/api) — production image for free container hosts
# (Render / Railway / Fly / Koyeb). Builds the NestJS API + its @ongo/db
# Prisma package from the pnpm monorepo, then runs migrations on boot.
# Build context = repo root.   docker build -t ongo-brain .
# ─────────────────────────────────────────────────────────────────────────
FROM node:20-slim AS base
# Prisma needs OpenSSL present at runtime (binaryTargets: debian-openssl-3.0.x).
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

# ── deps + build ──────────────────────────────────────────────────────────
FROM base AS build
# Manifests first for layer caching.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/tsconfig/package.json packages/tsconfig/
COPY packages/db/package.json packages/db/
COPY apps/api/package.json apps/api/
# Install the api + db + tsconfig workspaces (and their deps).
RUN pnpm install --no-frozen-lockfile --filter @ongo/api... --filter @ongo/db...

# Source.
COPY packages/tsconfig packages/tsconfig
COPY packages/db packages/db
COPY apps/api apps/api

# Build @ongo/db (prisma generate + tsc) then the API.
RUN pnpm --filter @ongo/db build \
  && pnpm --filter @ongo/api build

# ── runtime ───────────────────────────────────────────────────────────────
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app /app
COPY scripts/start.sh /app/scripts/start.sh
RUN chmod +x /app/scripts/start.sh
# $PORT is provided by the host; default for local runs.
ENV PORT=3001
EXPOSE 3001
CMD ["/app/scripts/start.sh"]
