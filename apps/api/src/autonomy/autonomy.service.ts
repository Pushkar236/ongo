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
  errors: string[];
}

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
  private readonly intervalMs: number;
  private enabled: boolean;
  private timer?: NodeJS.Timeout;
  private running = false;
  private tickCount = 0;
  private lastTickAt?: string;
  private lastReport?: TickReport;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly brain: BrainService,
    private readonly github: GithubService,
  ) {
    const flag = (config.get<string>("AUTONOMY_ENABLED") ?? "").toLowerCase();
    this.enabled = flag === "true" || flag === "1" || flag === "yes";
    this.intervalMs =
      Number(config.get("AUTONOMY_INTERVAL_MS")) || 15 * 60 * 1000;
  }

  onModuleInit() {
    if (this.enabled) this.start();
    else this.logger.log("Autonomy engine idle (AUTONOMY_ENABLED not set).");
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
      github: this.github.status(),
      lastReport: this.lastReport,
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
      errors: [],
    };

    try {
      await this.runDiscovery(report);
      await this.runGithubMaintenance(report);
      await this.runShowcaseSync(report);
      await this.runProfileSync(report);
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
            errors: report.errors,
          } as Prisma.InputJsonValue,
        },
      });
    } catch {
      /* non-fatal */
    }
  }
}
