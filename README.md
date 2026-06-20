# OnGo — AI Business Operating Platform

> **Your Business. Online. OnGo.**
>
> A Founder Command Center where one founder operates like a 20-person software
> agency through specialized AI agents. Agents do the work; the founder makes the
> decisions. Every action flows through **OnGo Brain**, which enforces
> human-in-the-loop approvals and an immutable audit trail.

This is a **pnpm + Turborepo monorepo**:

| App / package        | What it is |
|----------------------|------------|
| `apps/web`           | Public marketing site + (future) marketplace — Next.js 15 |
| `apps/dashboard`     | Founder Command Center — Next.js 15, auth-gated |
| `apps/api`           | **OnGo Brain** — NestJS orchestration backend |
| `packages/db`        | Prisma schema, client, migrations, seed |
| `packages/tsconfig`  | Shared TypeScript configs |

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for the design and **[ROADMAP.md](./ROADMAP.md)**
for what's built and what's next.

## Prerequisites
- Node ≥ 20, pnpm ≥ 10, Docker Desktop

## Quick start

```bash
# 1. Install
pnpm install

# 2. Configure env
cp .env.example .env        # adjust if you already run Postgres on 5432

# 3. Infra
pnpm docker:up              # Postgres (:5433) + Redis (:6379)

# 4. Database
pnpm --filter @ongo/db migrate    # apply schema
pnpm --filter @ongo/db seed       # founder + 7 agents + sample data

# 5. Run the Brain + the Command Center
pnpm --filter @ongo/api dev        # → http://localhost:3001/api/v1  (Swagger: /api/docs)
pnpm --filter @ongo/dashboard dev  # → http://localhost:3002
```

**Seeded founder login:** `founder@ongo.ai` / `OnGoFounder!2026`

The public marketing site still runs independently:

```bash
pnpm --filter @ongo/web dev        # → http://localhost:3000
```

## Try the Brain directly

```bash
# Log in
TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"founder@ongo.ai","password":"OnGoFounder!2026"}' | jq -r .accessToken)

# A high-risk action is BLOCKED until you approve it in the dashboard:
curl -s -X POST http://localhost:3001/api/v1/brain/actions \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"agentId":"<devops-agent-id>","actionType":"deploy.production"}'
# → { "status": "pending_approval", ... }
```

## Workspace scripts
- `pnpm dev` / `pnpm build` / `pnpm lint` / `pnpm test` — Turbo across all apps
- `pnpm db:migrate` / `pnpm db:seed` / `pnpm db:studio` — database
- `pnpm docker:up` / `pnpm docker:down` — infra

## Tests
```bash
pnpm --filter @ongo/api test     # Brain approval-policy + RBAC unit tests
```

## Deployment
`apps/web` and `apps/dashboard` deploy to Vercel. The API + Postgres + Redis run as
containers (see `apps/api/Dockerfile` and the `full` profile in `docker-compose.yml`)
on a container host — not Vercel serverless.
