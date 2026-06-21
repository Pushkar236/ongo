# Deploying the OnGo Brain for free, 24/7

The backend (`apps/api` + Postgres) can run continuously on free tiers. This is
the stack and the exact steps.

```
 Neon (free Postgres)  ──►  Render (free web service, Docker)  ◄── UptimeRobot
      DATABASE_URL              runs apps/api + autonomy loop      pings /health
                                                                     every 5 min
```

**Why this works:** Render's free web service sleeps after ~15 min with no
traffic. The autonomy engine is an in-process interval, so if the process
sleeps, the loop stops. UptimeRobot hitting `/api/v1/health` every 5 minutes
keeps the service awake → the loop keeps ticking → effectively 24/7. Redis is
**not** required (nothing imports it yet).

> Prerequisite: this repo must be on GitHub and include the latest commits
> (Dockerfile, render.yaml, autonomy engine). Render deploys from GitHub.

---

## 1. Database — Neon (free, no expiry)

1. Sign up at <https://neon.tech> → **New Project**.
2. Copy the **connection string** (looks like
   `postgresql://USER:PASS@ep-xxx.neon.tech/neondb?sslmode=require`).
3. Keep it — it's `DATABASE_URL` in step 2.

(Render's own free Postgres also works but expires after ~30 days; Neon doesn't.)

## 2. Backend — Render (free, Docker, Blueprint)

1. Sign up at <https://render.com> with your GitHub.
2. **New → Blueprint** → pick this repo. Render reads `render.yaml` and creates
   the `ongo-brain` web service.
3. When prompted, fill the `sync:false` env vars:
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | the Neon string from step 1 |
   | `SEED_ON_START` | `true` *(first deploy only — creates founder + agents)* |
   | `CORS_ORIGINS` | your dashboard URL, e.g. `https://ongo-mauve.vercel.app` |
   | `ANTHROPIC_API_KEY` | a real `sk-ant-api…` key, or leave blank for mock |
   | `GITHUB_TOKEN` / `GITHUB_REPOS` | optional, for repo maintenance |
4. Click **Apply**. First build runs migrations + seed, then boots.
5. After it's live, **remove `SEED_ON_START`** (or set to `false`) and redeploy
   so it doesn't reseed.
6. Note the service URL, e.g. `https://ongo-brain.onrender.com`.
   - Health: `https://ongo-brain.onrender.com/api/v1/health`
   - Swagger: `https://ongo-brain.onrender.com/api/docs`

## 3. Keep-alive — UptimeRobot (free)

1. Sign up at <https://uptimerobot.com>.
2. **Add New Monitor** → type **HTTP(s)**.
3. URL: `https://ongo-brain.onrender.com/api/v1/health`
4. Monitoring interval: **5 minutes**.
5. Save. It now pings the service, keeping it awake and tracking uptime.

## 4. Point the dashboard at it

In the dashboard host (Vercel), set
`NEXT_PUBLIC_API_URL=https://ongo-brain.onrender.com/api/v1` and redeploy.

---

## Login

Seeded founder: `founder@ongo.ai` / `OnGoFounder!2026` (override via
`SEED_FOUNDER_EMAIL` / `SEED_FOUNDER_PASSWORD` env vars before first seed).

## Flipping agents from mock → live

Set a real `ANTHROPIC_API_KEY` (`sk-ant-api…`, billed, from
console.anthropic.com) in Render and redeploy. A `sk-ant-oat…` subscription
token is **not** an API key — the Brain rejects it and stays on mock.

## Turning the 24/7 loop on/off

`AUTONOMY_ENABLED=true` (set in `render.yaml`) starts it on boot. You can also
Start/Stop/Run-one-cycle from the dashboard's **Autonomy Engine** page, or via
`POST /api/v1/autonomy/{start,stop,tick}`.

## Notes / limits

- Free Render: 750 instance-hours/month (enough for one always-on service) and a
  shared CPU; fine for the orchestrator. Heavy LLM workloads may warrant a paid
  plan later.
- Alternatives if you prefer: **Koyeb** (one free service, doesn't sleep) or
  **Fly.io** both work with the same `Dockerfile`; only the keep-alive differs.
