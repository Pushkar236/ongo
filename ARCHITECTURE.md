# OnGo — System Architecture

OnGo is an **AI Business Operating Platform**: a Founder Command Center where one
founder operates like a 20-person software agency through specialized AI agents.
Agents do the work; the founder makes the decisions. Every agent action flows
through a central orchestrator — **OnGo Brain** — which enforces human-in-the-loop
approval levels and writes an immutable audit trail.

> **Core principle (enforced in code):** there is no agent-to-agent communication.
> Agents emit *action requests* to the Brain; the Brain validates permission,
> classifies the approval level, executes or blocks, and logs everything.

## Monorepo layout

```
F:\OnGo\  (pnpm workspaces + Turborepo)
├─ apps/
│  ├─ web/         Public marketing site + marketplace (Next.js 15, Tailwind v3)
│  ├─ dashboard/   Founder Command Center (Next.js 15, Tailwind v4)
│  └─ api/         OnGo Brain — NestJS orchestration backend
├─ packages/
│  ├─ db/          Prisma schema, client, migrations, seed
│  └─ tsconfig/    Shared TypeScript configs
├─ docker-compose.yml   Postgres + Redis (+ api in the `full` profile)
└─ turbo.json / pnpm-workspace.yaml / .env.example
```

## Components

| Layer       | Tech                                   | Responsibility |
|-------------|----------------------------------------|----------------|
| Public web  | Next.js 15, Tailwind v3, Framer Motion | Marketing + (future) marketplace lead intake |
| Dashboard   | Next.js 15, Tailwind v4                | Founder Command Center (auth-gated) |
| API (Brain) | NestJS 10, TypeScript strict           | Auth/RBAC, orchestration, approvals, audit |
| Database    | PostgreSQL 16 + Prisma 5               | System of record |
| Cache/queue | Redis 7 (BullMQ — Phase 2+)            | Caching + async agent jobs |

## OnGo Brain — request lifecycle

```
Agent → POST /api/v1/brain/actions
          │
          ▼
   BrainService.dispatch()
     1. agent exists?                       → 404 if not
     2. agent permitted for actionType?     → 403 (deny-by-default)
     3. classify via ApprovalPolicy
          ├─ AUTO (L1)      → execute (AgentRunner) + activity_log
          ├─ SUGGESTED (L2) → execute + flagged approval (AUTO_APPROVED) + log
          └─ MANDATORY (L3) → DO NOT execute; create PENDING approval,
                              notify founders, log → wait for human
```

Approving a MANDATORY action (`POST /approvals/:id/approve`, FOUNDER/ADMIN only)
calls `BrainService.executeApproved()`, which runs the originally-blocked work and
records the result. Rejecting records the decision and executes nothing.

The `AgentRunner` is an abstract contract with a `MockAgentRunner` implementation
today; swapping in an LLM-backed runner (Anthropic API) is a one-line provider
change in `brain.module.ts` — the Brain depends only on the interface.

## Security model

- **JWT** access + refresh tokens (bcrypt password hashing).
- **RBAC** via a global `RolesGuard` + `@Roles()` — roles: FOUNDER, ADMIN, OPERATOR, AGENT.
- **Deny-by-default** agent permissions: an agent can only request action types
  explicitly listed in its `permissions`.
- **Rate limiting** via `@nestjs/throttler` (global + tighter on auth).
- **Audit trail**: a global `AuditInterceptor` logs human mutations; the Brain logs
  every agent action. `activity_logs` is append-only.
- Approvals can only be resolved by humans (FOUNDER/ADMIN) — never an AGENT.

## Data model (high level)

`users · agents · projects · tasks · workflows · repositories · deployments ·
activity_logs · opportunities · customers · leads · revenue · approvals ·
notifications` — see `packages/db/prisma/schema.prisma` for the full schema and enums.

## Local development

See the root [README](./README.md). TL;DR:

```bash
pnpm install
pnpm docker:up                  # Postgres + Redis
pnpm --filter @ongo/db migrate  # apply schema
pnpm --filter @ongo/db seed     # founder + 7 agents + sample data
pnpm --filter @ongo/api dev     # Brain → :3001 (Swagger /api/docs)
pnpm --filter @ongo/dashboard dev   # Command Center → :3002
```

## Deployment notes

`apps/web` and `apps/dashboard` are Vercel-friendly. **`apps/api` + Postgres + Redis
cannot run on Vercel serverless** — they target a container host (Railway / Render /
Fly / a VPS). `apps/api/Dockerfile` builds a production image; `docker-compose.yml`
(`full` profile) runs the whole stack in containers.
