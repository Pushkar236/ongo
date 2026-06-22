import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ActorType, Prisma } from "@ongo/db";
import { PrismaService } from "../prisma/prisma.service";
import { BrainService } from "../brain/brain.service";
import { GithubService } from "../github/github.service";

export interface TickReport {
  at: string;
  trigger: "auto" | "manual";
  discovery: { ran: boolean; summary?: string };
  github: { scanned: boolean; findings: number; tasksOpened: number };
  showcase: {
    synced: boolean;
    repos: number;
    featured: number;
    created: number;
    updated: number;
  };
  profile: { attempted: boolean; updated: boolean; reason?: string };
  incubator: { ran: boolean; created: boolean; repo?: string; reason?: string };
  development: {
    ran: boolean;
    committed: boolean;
    repo?: string;
    file?: string;
    reason?: string;
  };
  errors: string[];
}

// The fixed scaffold the development agent builds, one file per cycle. Each
// step's content is written by the Developer agent (LLM); `fallback` guarantees
// a real, sensible commit even if the model output is unusable.
const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const DEV_PLAN: Array<{
  path: string;
  instruction: string;
  fallback: (name: string, desc: string) => string;
}> = [
  {
    path: ".gitignore",
    instruction: "Generate a standard Node/TypeScript .gitignore file.",
    fallback: () =>
      ["node_modules", "dist", ".next", ".env", ".env.local", "*.log", ".DS_Store", ""].join("\n"),
  },
  {
    path: "package.json",
    instruction:
      "Generate a minimal package.json for a TypeScript project: name, version 0.1.0, private true, and dev/build/start scripts.",
    fallback: (name) =>
      JSON.stringify(
        { name: slug(name), version: "0.1.0", private: true, scripts: { dev: "tsx src/index.ts", build: "tsc", start: "node dist/index.js" } },
        null,
        2,
      ) + "\n",
  },
  {
    path: "src/index.ts",
    instruction:
      "Write src/index.ts — the TypeScript entry point that wires up and runs the core of the project described.",
    fallback: (name, desc) =>
      `// ${name}\n// ${desc}\nimport { core } from "./core";\n\nfunction main() {\n  console.log("[${name}]", core.describe());\n}\n\nmain();\n`,
  },
  {
    path: "src/types.ts",
    instruction: "Write src/types.ts with TypeScript interfaces for the core domain of this project.",
    fallback: (name) =>
      `// Core domain types for ${name}\nexport interface Entity {\n  id: string;\n  createdAt: string;\n}\n`,
  },
  {
    path: "src/core.ts",
    instruction: "Write src/core.ts — the core business-logic module implementing the project's main feature.",
    fallback: (name, desc) =>
      `// Core logic for ${name}\n// ${desc}\nexport const core = {\n  describe() {\n    return "${name}: ${desc.replace(/"/g, "'")}";\n  },\n};\n`,
  },
  {
    path: "docs/ARCHITECTURE.md",
    instruction:
      "Write docs/ARCHITECTURE.md describing the planned modules, data flow, and roadmap for this project.",
    fallback: (name, desc) =>
      `# ${name} — Architecture\n\n> ${desc}\n\n## Modules\n- \`src/index.ts\` — entry point\n- \`src/core.ts\` — core logic\n- \`src/types.ts\` — domain types\n\n## Roadmap\n- [ ] MVP feature\n- [ ] Tests\n- [ ] CI + deploy\n`,
  },
];

/**
 * The always-on engine. On a fixed interval it wakes and drives the platform
 * forward without a human poking it:
 *   1. Discovery  — a Research-agent scan that surfaces a new opportunity.
 *   2. Maintenance — scans the connected GitHub repos and opens tasks for
 *      anything that needs attention (stale issues, open PRs, untriaged).
 *   3. Showcase    — syncs the founder's public GitHub repos into Projects so
 *      the live OnGo site auto-displays real shipped work (no token needed).
 *
 * Every action still flows through the Brain, so the approval policy and audit
 * trail apply. "24/7" is only as good as the host: this loop runs while the API
 * process is alive — on a laptop that's not 24/7; on a container host it is.
 */
@Injectable()
export class AutonomyService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AutonomyService.name);
  private intervalMs: number;
  private enabled: boolean;
  private timer?: NodeJS.Timeout;
  private running = false;
  private tickCount = 0;
  private lastTickAt?: string;
  private lastReport?: TickReport;
  // Project incubator: auto-create repos from discovered ideas. Off by default
  // (opt in with AUTONOMY_INCUBATOR=true) and capped so it can't run away.
  private readonly incubatorEnabled: boolean;
  private readonly incubatorMax: number;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly brain: BrainService,
    private readonly github: GithubService,
  ) {
    const flag = (config.get<string>("AUTONOMY_ENABLED") ?? "").toLowerCase();
    this.enabled = flag === "true" || flag === "1" || flag === "yes";
    this.intervalMs =
      Number(config.get("AUTONOMY_INTERVAL_MS")) || 5 * 60 * 1000;
    const inc = (config.get<string>("AUTONOMY_INCUBATOR") ?? "").toLowerCase();
    this.incubatorEnabled = inc === "true" || inc === "1" || inc === "yes";
    this.incubatorMax = Number(config.get("AUTONOMY_INCUBATOR_MAX")) || 3;
  }

  async onModuleInit() {
    // A persisted interval (set via POST /autonomy/config) overrides the env,
    // so cadence survives redeploys without touching the host's env vars.
    try {
      const s = await this.prisma.setting.findUnique({
        where: { key: "autonomy.intervalMs" },
      });
      const v = Number(s?.value);
      if (Number.isFinite(v) && v >= 15000) this.intervalMs = v;
    } catch {
      /* settings table not migrated yet — keep env/default */
    }
    if (this.enabled) this.start();
    else this.logger.log("Autonomy engine idle (AUTONOMY_ENABLED not set).");
  }

  /** Founder-tunable runtime config; persists across redeploys via Settings. */
  async setConfig(opts: { intervalMs?: number }) {
    if (opts.intervalMs != null) {
      const ms = Math.max(15000, Math.floor(opts.intervalMs));
      this.intervalMs = ms;
      await this.prisma.setting.upsert({
        where: { key: "autonomy.intervalMs" },
        create: { key: "autonomy.intervalMs", value: String(ms) },
        update: { value: String(ms) },
      });
      if (this.timer) {
        // Restart the timer so the new interval takes effect immediately.
        this.stop();
        this.start();
      }
    }
    return this.status();
  }

  onModuleDestroy() {
    this.stop();
  }

  start() {
    if (this.timer) return;
    this.enabled = true;
    this.timer = setInterval(
      () => void this.tick("auto"),
      this.intervalMs,
    );
    // Unref so the loop never holds the process open on its own.
    this.timer.unref?.();
    // Kick one tick shortly after boot so the showcase fills immediately
    // instead of waiting a full interval after a deploy/restart.
    const warmup = setTimeout(() => void this.tick("auto"), 4000);
    warmup.unref?.();
    this.logger.log(
      `Autonomy engine started — tick every ${Math.round(this.intervalMs / 1000)}s.`,
    );
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    this.enabled = false;
    this.logger.log("Autonomy engine stopped.");
  }

  status() {
    return {
      enabled: this.enabled,
      running: this.running,
      intervalMs: this.intervalMs,
      tickCount: this.tickCount,
      lastTickAt: this.lastTickAt,
      agentRunner: this.brain.runnerKind(),
      llm: this.llmDiagnostics(),
      github: this.github.status(),
      incubator: { enabled: this.incubatorEnabled, max: this.incubatorMax },
      lastReport: this.lastReport,
    };
  }

  /**
   * Why the agents are live vs mock — reports which provider env vars are
   * present (booleans + non-secret base/model only, never the keys). The
   * OpenAI-compatible (free) runner needs ALL of LLM_API_KEY + LLM_BASE_URL +
   * LLM_MODEL; a real Anthropic key (sk-ant-api…) takes precedence.
   */
  private llmDiagnostics() {
    const get = (k: string) => this.config.get<string>(k)?.trim() || "";
    const anth = get("ANTHROPIC_API_KEY");
    const providers: string[] = [];
    if (anth.startsWith("sk-ant-api")) providers.push("anthropic");
    for (const sfx of ["", "_2", "_3", "_4"]) {
      if (get(`LLM_API_KEY${sfx}`) && get(`LLM_BASE_URL${sfx}`) && get(`LLM_MODEL${sfx}`)) {
        providers.push(get(`LLM_PROVIDER${sfx}`) || get(`LLM_MODEL${sfx}`));
      }
    }
    return {
      providerCount: providers.length,
      providers, // ordered fallback chain — work spreads across these
      hasLlmKey: Boolean(get("LLM_API_KEY")),
      hasLlmBase: Boolean(get("LLM_BASE_URL")),
      hasLlmModel: Boolean(get("LLM_MODEL")),
      llmBase: get("LLM_BASE_URL") || null,
      llmModel: get("LLM_MODEL") || null,
      anthropicKeyKind: anth
        ? anth.startsWith("sk-ant-api")
          ? "api"
          : anth.startsWith("sk-ant-oat")
            ? "oat(ignored)"
            : "other"
        : "none",
    };
  }

  /**
   * Run one cycle. Re-entrancy guarded so a slow tick never overlaps the next.
   */
  async tick(trigger: "auto" | "manual"): Promise<TickReport> {
    if (this.running) {
      return (
        this.lastReport ?? {
          at: new Date().toISOString(),
          trigger,
          discovery: { ran: false },
          github: { scanned: false, findings: 0, tasksOpened: 0 },
          showcase: { synced: false, repos: 0, featured: 0, created: 0, updated: 0 },
          profile: { attempted: false, updated: false },
          incubator: { ran: false, created: false },
          development: { ran: false, committed: false },
          errors: ["tick already running"],
        }
      );
    }
    this.running = true;
    const report: TickReport = {
      at: new Date().toISOString(),
      trigger,
      discovery: { ran: false },
      github: { scanned: false, findings: 0, tasksOpened: 0 },
      showcase: { synced: false, repos: 0, featured: 0, created: 0, updated: 0 },
      profile: { attempted: false, updated: false },
      incubator: { ran: false, created: false },
      development: { ran: false, committed: false },
      errors: [],
    };

    try {
      await this.runDiscovery(report);
      await this.runGithubMaintenance(report);
      await this.runShowcaseSync(report);
      await this.runProfileSync(report);
      await this.runProjectIncubator(report);
      await this.runProjectDevelopment(report);
      await this.heartbeat(report);
    } catch (err) {
      report.errors.push(String(err));
      this.logger.error(`tick failed: ${String(err)}`);
    } finally {
      this.running = false;
      this.tickCount += 1;
      this.lastTickAt = report.at;
      this.lastReport = report;
    }
    return report;
  }

  /** Discovery: let the Research agent surface one new opportunity. */
  private async runDiscovery(report: TickReport) {
    try {
      const research = await this.prisma.agent.findFirst({
        where: { type: "RESEARCH" },
      });
      if (!research) return;
      // Stop the pile-up: once there's a healthy backlog of unreviewed
      // opportunities, skip discovery and let the build agents catch up.
      const openOpps = await this.prisma.opportunity.count({
        where: { status: { in: ["NEW", "REVIEWING"] } },
      });
      if (openOpps >= 20) {
        report.discovery = {
          ran: false,
          summary: `discovery paused — ${openOpps} opportunities awaiting review`,
        };
        return;
      }
      const outcome = await this.brain.dispatch({
        agentId: research.id,
        actionType: "research.scan",
        title: "Autonomous market scan",
        payload: { trigger: "autonomy", at: report.at },
      });
      report.discovery = {
        ran: true,
        summary:
          outcome.status === "executed"
            ? outcome.result.summary
            : outcome.message,
      };
    } catch (err) {
      report.errors.push(`discovery: ${String(err)}`);
    }
  }

  /**
   * Maintenance: scan connected repos and open a task per finding through the
   * Brain. Tasks are deduped against still-open maintenance tasks so repeated
   * ticks don't pile up duplicates.
   */
  private async runGithubMaintenance(report: TickReport) {
    if (!this.github.configured()) return;
    try {
      const findings = await this.github.maintenanceScan();
      report.github.scanned = true;
      report.github.findings = findings.length;
      if (findings.length === 0) return;

      const devops = await this.prisma.agent.findFirst({
        where: { type: "DEVOPS" },
      });
      if (!devops) return;
      await this.ensurePermissions(devops.id, devops.permissions, [
        "task.create",
      ]);

      const existing = await this.prisma.task.findMany({
        where: { status: { in: ["PENDING", "IN_PROGRESS"] } },
        select: { title: true },
      });
      const seen = new Set(existing.map((t) => t.title));

      for (const f of findings) {
        const taskTitle = `[GitHub] ${f.title}`;
        if (seen.has(taskTitle)) continue;
        await this.brain.dispatch({
          agentId: devops.id,
          actionType: "task.create",
          title: taskTitle,
          payload: {
            title: taskTitle,
            description: `${f.detail}\n${f.repo} · ${f.url}\nSuggested: ${f.suggestedAction}`,
            source: "github-maintenance",
          },
        });
        seen.add(taskTitle);
        report.github.tasksOpened += 1;
      }
    } catch (err) {
      report.errors.push(`github: ${String(err)}`);
    }
  }

  /**
   * Showcase sync: pull the founder's public GitHub repos and upsert them as
   * Projects so the live OnGo site can display real, shipped work — updating
   * itself every tick. Read-only and token-free. Curated ("manual") projects
   * are never clobbered; only github-synced rows are managed here.
   */
  private async runShowcaseSync(report: TickReport) {
    if (!this.github.showcaseConfigured()) return;
    try {
      const repos = await this.github.listShowcaseRepos();
      report.showcase.synced = true;
      report.showcase.repos = repos.length;

      const syncedSlugs: string[] = [];
      for (const r of repos) {
        const slug = this.slugify(r.name);
        if (!slug) continue;
        syncedSlugs.push(slug);

        // A repo earns the public site if it shows real signal.
        const featured = Boolean(
          (r.description && r.description.trim()) || r.homepage || r.stars > 0,
        );
        if (featured) report.showcase.featured += 1;

        const common = {
          name: r.name,
          description: r.description ?? null,
          repoUrl: r.htmlUrl,
          liveUrl: r.homepage,
          tech: r.tech,
          stars: r.stars,
          featured,
          source: "github-sync",
          pushedAt: new Date(r.pushedAt),
          lastSyncedAt: new Date(),
          status: "ACTIVE" as const,
          type: "INTERNAL" as const,
          deploymentStatus: (r.homepage ? "LIVE" : "NONE") as
            | "LIVE"
            | "NONE",
        };

        const existing = await this.prisma.project.findUnique({
          where: { slug },
          select: { id: true, source: true },
        });
        if (existing) {
          // Don't overwrite a hand-curated project that happens to share a slug.
          if (existing.source === "manual") continue;
          await this.prisma.project.update({ where: { slug }, data: common });
          report.showcase.updated += 1;
        } else {
          await this.prisma.project.create({ data: { slug, ...common } });
          report.showcase.created += 1;
        }
      }

      // Reconcile: any github-synced project that fell out of the current
      // top-N is no longer featured, so the public showcase stays a clean,
      // bounded set instead of accumulating stragglers. Guarded so a transient
      // empty scan never blanks the site.
      if (syncedSlugs.length > 0) {
        await this.prisma.project.updateMany({
          where: {
            source: "github-sync",
            featured: true,
            slug: { notIn: syncedSlugs },
          },
          data: { featured: false },
        });
      }
    } catch (err) {
      report.errors.push(`showcase: ${String(err)}`);
    }
  }

  private slugify(s: string): string {
    return s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  /**
   * Idempotently grant an agent the action types it needs. A runtime migration
   * so the live DB (seeded before these actions existed) gains them without a
   * reseed. Deny-by-default still holds for everything not listed here.
   */
  private async ensurePermissions(
    agentId: string,
    current: string[],
    needed: string[],
  ): Promise<void> {
    const missing = needed.filter((p) => !current.includes(p));
    if (missing.length === 0) return;
    await this.prisma.agent.update({
      where: { id: agentId },
      data: { permissions: { set: [...new Set([...current, ...needed])] } },
    });
  }

  /**
   * Profile sync: keep an auto-curated "Featured Projects" section in the
   * founder's GitHub profile README (owner/owner repo) in step with the
   * showcase — so the profile stays strong and consistent on its own. Needs a
   * token (write). Routed through the Brain (approval + audit); only the
   * delimited OnGo section is touched, the rest of the README is preserved.
   */
  private async runProfileSync(report: TickReport) {
    if (!this.github.configured()) return; // write needs a token
    const user = this.github.showcaseUserName();
    if (!user) return;
    report.profile.attempted = true;
    try {
      const projects = await this.prisma.project.findMany({
        where: { featured: true },
        orderBy: [
          { liveUrl: { sort: "desc", nulls: "last" } },
          { stars: "desc" },
          { pushedAt: "desc" },
        ],
        take: 8,
        select: { name: true, repoUrl: true, liveUrl: true, tech: true },
      });
      if (projects.length === 0) {
        report.profile.reason = "no featured projects yet";
        return;
      }

      const devops = await this.prisma.agent.findFirst({
        where: { type: "DEVOPS" },
      });
      if (!devops) {
        report.profile.reason = "no devops agent";
        return;
      }
      // Grant the GitHub-profile permission once (runtime migration so we don't
      // depend on a reseed of the live database).
      await this.ensurePermissions(devops.id, devops.permissions, [
        "github.profile.update",
      ]);

      const profileRepo = `${user}/${user}`;
      const outcome = await this.brain.dispatch({
        agentId: devops.id,
        actionType: "github.profile.update",
        title: "Refresh GitHub profile README (Featured Projects)",
        payload: { repo: profileRepo, projects: projects.length },
      });
      if (outcome.status !== "executed") {
        report.profile.reason = "blocked by approval policy";
        return;
      }

      const section = this.buildProfileSection(projects);
      const existing = await this.github.getFile(profileRepo, "README.md");
      const base = existing?.content ?? "";
      const merged = this.mergeManagedSection(base, section);
      if (existing && merged.trim() === existing.content.trim()) {
        report.profile.reason = "already up to date";
        return;
      }
      await this.github.putFile(
        profileRepo,
        "README.md",
        merged,
        "chore: refresh featured projects (OnGo autopilot)",
        existing?.sha,
      );
      report.profile.updated = true;
    } catch (err) {
      report.errors.push(`profile: ${String(err)}`);
      report.profile.reason = String(err).slice(0, 120);
    }
  }

  /** Build the OnGo-managed "Featured Projects" markdown block. */
  private buildProfileSection(
    projects: Array<{
      name: string;
      repoUrl: string | null;
      liveUrl: string | null;
      tech: string[];
    }>,
  ): string {
    const today = new Date().toISOString().slice(0, 10);
    const rows = projects
      .map((p) => {
        const links = [
          p.liveUrl ? `[Live](${p.liveUrl})` : null,
          p.repoUrl ? `[Code](${p.repoUrl})` : null,
        ]
          .filter(Boolean)
          .join(" · ");
        const stack = (p.tech ?? []).slice(0, 3).join(", ") || "—";
        return `| **${p.name}** | ${stack} | ${links || "—"} |`;
      })
      .join("\n");
    return [
      "### 🚀 Featured Projects",
      "",
      "| Project | Stack | Links |",
      "| --- | --- | --- |",
      rows,
      "",
      `<sub>↻ Auto-curated by <a href="https://ongo-mauve.vercel.app">OnGo</a> · updated ${today}</sub>`,
    ].join("\n");
  }

  /** Replace (or append) the delimited OnGo section, leaving the rest intact. */
  private mergeManagedSection(existing: string, section: string): string {
    const START = "<!-- ONGO:START -->";
    const END = "<!-- ONGO:END -->";
    const block = `${START}\n${section}\n${END}`;
    if (existing.includes(START) && existing.includes(END)) {
      return existing.replace(
        new RegExp(`${START}[\\s\\S]*${END}`),
        block,
      );
    }
    return `${existing.trimEnd()}\n\n${block}\n`;
  }

  /** Founder-triggered single incubation (bypasses the auto flag). */
  async incubateOnce(): Promise<TickReport["incubator"]> {
    const report = {
      incubator: { ran: false, created: false },
      errors: [],
    } as unknown as TickReport;
    await this.runProjectIncubator(report, true);
    return report.incubator;
  }

  /**
   * Incubator: turn a discovered opportunity into a real, brand-new GitHub repo
   * (private by default) with a structured README, registered as a Project.
   * Auto-runs only when AUTONOMY_INCUBATOR=true (else it's manual-trigger only),
   * capped at AUTONOMY_INCUBATOR_MAX, and routed through the Brain for audit.
   */
  private async runProjectIncubator(report: TickReport, force = false) {
    if (!this.github.configured()) {
      report.incubator.reason = "no GITHUB_TOKEN";
      return;
    }
    if (!force && !this.incubatorEnabled) return; // opt-in for autonomous runs
    const user = this.github.showcaseUserName();
    if (!user) {
      report.incubator.reason = "no GITHUB_USER";
      return;
    }
    report.incubator.ran = true;
    try {
      const incubatedCount = await this.prisma.project.count({
        where: { source: "incubated" },
      });
      if (incubatedCount >= this.incubatorMax) {
        report.incubator.reason = `cap reached (${this.incubatorMax})`;
        return;
      }

      const opp = await this.prisma.opportunity.findFirst({
        where: { status: { in: ["NEW", "REVIEWING"] } },
        orderBy: [{ demandScore: "desc" }, { createdAt: "desc" }],
      });
      if (!opp) {
        report.incubator.reason = "no opportunity to incubate";
        return;
      }

      // Pick a name free on BOTH GitHub and our Project slugs, with a final
      // guard so we never try to create over a taken name (which would orphan
      // a repo and leave the opportunity to retry).
      const baseSlug = this.slugify(opp.title).slice(0, 80) || "ongo-project";
      let name = baseSlug;
      let taken = await this.nameTaken(user, name);
      for (let i = 2; i <= 10 && taken; i++) {
        name = `${baseSlug}-${i}`;
        taken = await this.nameTaken(user, name);
      }
      if (taken) {
        report.incubator.reason = "no available repo name";
        return;
      }

      const pm = await this.prisma.agent.findFirst({
        where: { type: "PRODUCT_MANAGER" },
      });
      if (!pm) {
        report.incubator.reason = "no product agent";
        return;
      }
      await this.ensurePermissions(pm.id, pm.permissions, [
        "github.repo.create",
      ]);

      const outcome = await this.brain.dispatch({
        agentId: pm.id,
        actionType: "github.repo.create",
        title: `Incubate project: ${opp.title}`,
        payload: { repo: name, opportunityId: opp.id },
      });
      if (outcome.status !== "executed") {
        report.incubator.reason = "blocked by approval policy";
        return;
      }

      const tech = ["TypeScript", "Next.js", "Tailwind CSS", "Node.js"];
      const created = await this.github.createRepo(name, opp.description ?? opp.title, {
        private: true,
      });
      const readme = this.buildProjectReadme(opp, tech);
      const existing = await this.github.getFile(created.fullName, "README.md");
      await this.github.putFile(
        created.fullName,
        "README.md",
        readme,
        "docs: project brief (OnGo incubator)",
        existing?.sha,
      );

      // Register as a Project. Kept internal (featured=false) while private;
      // when the founder makes the repo public, the showcase sync features it.
      // upsert (not create) so a slug clash can never throw and orphan the repo.
      const projectData = {
        name,
        description: opp.description ?? opp.title,
        status: "ACTIVE" as const,
        type: "SAAS" as const,
        repoUrl: created.htmlUrl,
        tech,
        featured: false,
        source: "incubated",
        pushedAt: new Date(),
        lastSyncedAt: new Date(),
      };
      await this.prisma.project.upsert({
        where: { slug: name },
        create: { slug: name, ...projectData },
        update: projectData,
      });
      await this.prisma.opportunity.update({
        where: { id: opp.id },
        data: { status: "CONVERTED" },
      });

      report.incubator.created = true;
      report.incubator.repo = created.fullName;
    } catch (err) {
      report.errors.push(`incubator: ${String(err)}`);
      report.incubator.reason = String(err).slice(0, 140);
    }
  }

  /** A name is unavailable if a GitHub repo OR an existing Project slug uses it. */
  private async nameTaken(user: string, name: string): Promise<boolean> {
    if (await this.github.repoExists(`${user}/${name}`)) return true;
    const p = await this.prisma.project.findUnique({
      where: { slug: name },
      select: { id: true },
    });
    return Boolean(p);
  }

  /** Structured project brief for a freshly incubated repo. */
  private buildProjectReadme(
    opp: {
      title: string;
      market: string;
      description: string | null;
      demandScore: number;
      recommendation: string | null;
    },
    tech: string[],
  ): string {
    return [
      `# ${opp.title}`,
      "",
      `> ${opp.description ?? opp.recommendation ?? opp.title}`,
      "",
      "🚀 **Status:** Incubating — auto-generated by [OnGo](https://ongo-mauve.vercel.app) from a discovered market opportunity.",
      "",
      "## 📌 Problem",
      opp.description ?? "See the opportunity brief.",
      "",
      "## 💡 Proposed Solution",
      opp.recommendation ?? "A focused MVP addressing the problem above.",
      "",
      "## 🎯 Market",
      `${opp.market} · demand score ${opp.demandScore}/100`,
      "",
      "## 🧩 Planned Features",
      "- [ ] Core MVP workflow",
      "- [ ] User onboarding & auth",
      "- [ ] Dashboard / analytics",
      "- [ ] Key integrations",
      "",
      "## 🛠 Tech Stack",
      tech.map((t) => `- ${t}`).join("\n"),
      "",
      "---",
      "<sub>🤖 Auto-incubated by OnGo from an opportunity surfaced by the Research agent. Make this repo public when ready and it appears on the OnGo showcase automatically.</sub>",
      "",
    ].join("\n");
  }

  /**
   * Development loop: each cycle the Developer agent builds out ONE incubated
   * project by generating + committing the next file in the scaffold plan.
   * Real commits accrue over cycles so projects actually get built (and the
   * contribution graph stays active). Writes only to PRIVATE incubated repos;
   * routed through the Brain (code.generate). Needs a token; no-op without one.
   */
  private async runProjectDevelopment(report: TickReport) {
    if (!this.github.configured()) return;
    try {
      const project = await this.prisma.project.findFirst({
        where: {
          source: "incubated",
          devStep: { lt: DEV_PLAN.length },
          repoUrl: { not: null },
        },
        orderBy: [{ devStep: "asc" }, { lastSyncedAt: "asc" }],
      });
      if (!project) {
        report.development.reason = "no incubated project needs building";
        return;
      }
      report.development.ran = true;

      const repo = this.repoFullNameFromUrl(project.repoUrl ?? "");
      if (!repo) {
        report.development.reason = "unparseable repoUrl";
        return;
      }
      const step = DEV_PLAN[project.devStep];

      const dev = await this.prisma.agent.findFirst({
        where: { type: "DEVELOPER" },
      });
      if (!dev) {
        report.development.reason = "no developer agent";
        return;
      }
      await this.ensurePermissions(dev.id, dev.permissions, ["code.generate"]);

      // Ask the Developer agent (LLM) to write the file; fall back to a sane
      // deterministic version so a commit always lands.
      const outcome = await this.brain.dispatch({
        agentId: dev.id,
        actionType: "code.generate",
        title: `Build ${project.name}: ${step.path}`,
        payload: {
          project: project.name,
          description: project.description ?? "",
          file: step.path,
          instruction: step.instruction,
          note: "Return ONLY the raw file contents in output.content — no markdown fences, no commentary.",
        },
      });

      let content = "";
      if (outcome.status === "executed") {
        const out = (outcome.result.output ?? {}) as Record<string, unknown>;
        if (typeof out.content === "string") content = out.content;
      }
      content = content.trim();
      if (content.startsWith("```")) {
        content = content
          .replace(/^```[^\n]*\n/, "")
          .replace(/\n```\s*$/, "")
          .trim();
      }
      if (!content) {
        content = step.fallback(project.name, project.description ?? "");
      }

      const existing = await this.github.getFile(repo, step.path);
      await this.github.putFile(
        repo,
        step.path,
        content.endsWith("\n") ? content : content + "\n",
        `feat: ${step.path} (OnGo dev agent)`,
        existing?.sha,
      );

      await this.prisma.project.update({
        where: { id: project.id },
        data: {
          devStep: { increment: 1 },
          pushedAt: new Date(),
          lastSyncedAt: new Date(),
        },
      });
      report.development.committed = true;
      report.development.repo = repo;
      report.development.file = step.path;
    } catch (err) {
      report.errors.push(`development: ${String(err)}`);
      report.development.reason = String(err).slice(0, 140);
    }
  }

  /** Extract "owner/repo" from a GitHub URL. */
  private repoFullNameFromUrl(url: string): string | null {
    const m = url.match(/github\.com\/([^/]+\/[^/]+?)(?:\.git)?\/?$/i);
    return m ? m[1] : null;
  }

  private async heartbeat(report: TickReport) {
    try {
      await this.prisma.activityLog.create({
        data: {
          actorType: ActorType.SYSTEM,
          actorName: "Autonomy Engine",
          action: "autonomy.tick",
          entity: "Autonomy",
          metadata: {
            trigger: report.trigger,
            discovery: report.discovery.ran,
            githubFindings: report.github.findings,
            tasksOpened: report.github.tasksOpened,
            showcaseRepos: report.showcase.repos,
            showcaseFeatured: report.showcase.featured,
            profileUpdated: report.profile.updated,
            incubatedRepo: report.incubator.repo,
            developed: report.development.committed
              ? `${report.development.repo}:${report.development.file}`
              : null,
            errors: report.errors,
          } as Prisma.InputJsonValue,
        },
      });
    } catch {
      /* non-fatal */
    }
  }
}
