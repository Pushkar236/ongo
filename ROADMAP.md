# OnGo — Implementation Roadmap

Built incrementally, foundation-first. **Phase 1 is complete** (this build).

## ✅ Phase 1 — Foundation (done)
- pnpm + Turborepo monorepo; existing marketing site folded into `apps/web`
- Docker Compose (Postgres + Redis) + `.env` handling
- Full Prisma schema (14 tables) + seed (founder + 7 agents + sample data)
- NestJS **OnGo Brain**: JWT auth + refresh, RBAC, rate limiting, audit interceptor
- Brain orchestrator: deny-by-default permissions, 3-tier approval policy, mock AgentRunner
- Approval Center flow (request → block → human approve/reject → execute)
- Founder Dashboard: login, Overview, Approval Center, Agent Activity, Projects,
  Opportunities, Agents — all wired to the live API
- Swagger/OpenAPI at `/api/docs`; unit tests for the approval policy

## Phase 2 — Real agents (in progress)
- ✅ **LLM-backed runner** (`AnthropicAgentRunner`, Anthropic API, `claude-opus-4-8`) —
  the Brain selects it automatically when `ANTHROPIC_API_KEY` is set; falls back to the
  mock runner otherwise. Per-agent-type personas; tolerant JSON output parsing.
- ✅ **Materialize**: executed actions now create real records — `research.scan`/
  `opportunity.create` → Opportunities, `task.create` → Tasks, `deploy.*` → Deployments.
  The platform visibly "does work" and the dashboard grows from agent runs.
- ⏳ Next: BullMQ on Redis for async agent jobs + retries; agent memory persistence;
  richer PM → Developer hand-off; per-agent scoped credentials.

## Phase 3.5 — Autonomy engine (the 24/7 loop) — in progress
- ✅ **`AutonomyService`** — a config-gated heartbeat (`AUTONOMY_ENABLED`,
  `AUTONOMY_INTERVAL_MS`) that wakes on an interval and drives the platform:
  discovery (Research scan → opportunity) + GitHub maintenance, all through the
  Brain, with a heartbeat written to the audit log. Re-entrancy-guarded.
- ✅ **GitHub integration** (`GithubService`, fetch-based REST) — read/scan of
  configured repos (`GITHUB_TOKEN`, `GITHUB_REPOS`): stale issues, open PRs,
  untriaged issues → opened as tasks. Write actions (`github.issue.comment`,
  `github.issue.create`, `github.pr.review` = SUGGESTED; `github.pr.merge` =
  MANDATORY) are gated by the approval policy.
- ✅ **Dashboard / Autonomy Engine page** — status, last-cycle report, connected
  repos; Start/Stop/Run-one-cycle controls.
- ⏳ Next, to be *truly* 24/7 + real: host the API on an always-on container
  platform; supply a metered `ANTHROPIC_API_KEY` so cycles reason instead of
  mock; wire the approved GitHub write executors into `materialize`.
- ⚠️ "Finding real-time projects" comes from **inbound** marketplace leads +
  Research-agent discovery — not scraping third-party marketplaces (ToS).

## Phase 3 — Build agents (Developer / QA / Documentation)
- Developer Agent: code generation + refactors (sandboxed), PR drafting
- QA Agent: automated test generation + regression reports
- Documentation Agent: docs, changelogs, status updates
- Workflow engine: chain agents into pipelines (still mediated by the Brain)

## Phase 4 — DevOps + GitHub + deployments
- DevOps Agent: deployment orchestration + monitoring
- GitHub integration: repo creation, commits, PRs, release notes, changelog
- `repositories` + `deployments` wired to real providers
- Provision the API + Postgres + Redis on a container host (Railway/Render/Fly)

## Phase 5 — Marketplace + revenue + client workflows
- Public marketplace in `apps/web`: website/automation/SaaS request intake → `leads`
- Auto-generate estimates + opportunity entries; route into workflows
- Revenue tracking + dashboards (Tremor charts), client portals
- Notifications (email/Slack) for approvals and milestones

## Cross-cutting (ongoing)
- Observability: structured logs, error tracking, agent action analytics
- Hardening: secrets management, per-agent scoped tokens, audit log retention
- Tests: e2e (Brain flows), integration (RBAC), dashboard component tests
