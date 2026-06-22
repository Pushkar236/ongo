import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export interface RepoRef {
  owner: string;
  repo: string;
  fullName: string;
}

export interface MaintenanceFinding {
  repo: string;
  kind:
    | "stale_issue"
    | "open_pr"
    | "untriaged_issue"
    | "failing_default_branch"
    | "vulnerable_dependency";
  title: string;
  detail: string;
  url: string;
  /** Suggested agent action type to route through the Brain. */
  suggestedAction: string;
}

interface GhIssue {
  number: number;
  title: string;
  html_url: string;
  updated_at: string;
  created_at: string;
  pull_request?: unknown;
  labels: Array<{ name: string }>;
  draft?: boolean;
}

interface GhRepo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
  private: boolean;
}

/** A public repo, normalized for the OnGo showcase. */
export interface ShowcaseRepo {
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  homepage: string | null;
  tech: string[];
  stars: number;
  pushedAt: string;
}

/**
 * Thin GitHub REST client. Read-only scanning works with any token; write
 * actions (comment / PR / merge) are routed through the OnGo Brain so the
 * approval policy still gates them — this service never writes on its own
 * except via the explicitly-approved executor methods.
 *
 * Uses the global fetch (Node 18+); no SDK dependency.
 */
@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name);
  private readonly token?: string;
  private readonly repos: RepoRef[];
  private readonly staleDays: number;
  // Public showcase config — works with NO token (public GitHub API).
  private readonly showcaseUser?: string;
  private readonly showcaseEnabled: boolean;
  private readonly showcaseMax: number;
  private readonly includeForks: boolean;

  constructor(config: ConfigService) {
    this.token = config.get<string>("GITHUB_TOKEN")?.trim() || undefined;
    this.staleDays = Number(config.get("GITHUB_STALE_DAYS")) || 30;
    this.repos = (config.get<string>("GITHUB_REPOS") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((fullName) => {
        const [owner, repo] = fullName.split("/");
        return { owner, repo, fullName };
      })
      .filter((r) => r.owner && r.repo);

    // The GitHub handle whose public repos feed the OnGo showcase. Defaults to
    // the founder's account so the site lights up with zero configuration.
    this.showcaseUser =
      config.get<string>("GITHUB_USER")?.trim() || "Pushkar236";
    const flag = (config.get<string>("GITHUB_SHOWCASE") ?? "true").toLowerCase();
    this.showcaseEnabled = flag !== "false" && flag !== "0" && flag !== "no";
    this.showcaseMax = Number(config.get("GITHUB_SHOWCASE_MAX")) || 12;
    this.includeForks =
      (config.get<string>("GITHUB_SHOWCASE_INCLUDE_FORKS") ?? "")
        .toLowerCase()
        .trim() === "true";
  }

  /** True when a token is set (required for repo *maintenance* / writes). */
  configured(): boolean {
    return Boolean(this.token);
  }

  /** The showcase sync needs no token — only a username and the feature on. */
  showcaseConfigured(): boolean {
    return this.showcaseEnabled && Boolean(this.showcaseUser);
  }

  configuredRepos(): RepoRef[] {
    return this.repos;
  }

  status() {
    return {
      connected: this.configured(),
      repos: this.repos.map((r) => r.fullName),
      staleDays: this.staleDays,
      showcaseUser: this.showcaseUser,
      showcaseEnabled: this.showcaseEnabled,
    };
  }

  private async gh<T>(path: string, init?: RequestInit): Promise<T> {
    if (!this.token) throw new Error("GITHUB_TOKEN not configured");
    return this.request<T>(path, init, this.token);
  }

  /**
   * GitHub request with OPTIONAL auth. Uses the token when present (5000
   * req/hr) but works unauthenticated (60 req/hr) — enough for read-only
   * public showcase syncs on a 15-minute tick.
   */
  private async request<T>(
    path: string,
    init: RequestInit | undefined,
    token: string | undefined,
  ): Promise<T> {
    const res = await fetch(`https://api.github.com${path}`, {
      ...init,
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "ongo-brain",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`GitHub ${res.status} ${path}: ${body.slice(0, 200)}`);
    }
    return (await res.json()) as T;
  }

  /**
   * List the public repos of the configured GitHub user, normalized for the
   * showcase. No token required. Forks/archived excluded by default; sorted by
   * most recently pushed. Throws on network/HTTP error (caller degrades).
   */
  async listShowcaseRepos(): Promise<ShowcaseRepo[]> {
    if (!this.showcaseConfigured()) return [];
    const repos = await this.request<GhRepo[]>(
      `/users/${this.showcaseUser}/repos?per_page=100&sort=pushed&type=owner`,
      undefined,
      this.token,
    );
    const userLower = (this.showcaseUser ?? "").toLowerCase();
    return repos
      .filter((r) => !r.private)
      .filter((r) => this.includeForks || !r.fork)
      .filter((r) => !r.archived)
      // Skip the profile README repo (owner/owner) — it's not a project.
      .filter((r) => r.name.toLowerCase() !== userLower)
      .map((r) => {
        const langLower = r.language?.toLowerCase();
        const tech = [
          ...(r.language ? [r.language] : []),
          ...((r.topics ?? []).filter(
            (t) => t && t.toLowerCase() !== langLower,
          )),
        ].slice(0, 6);
        return {
          name: r.name,
          fullName: r.full_name,
          description: r.description,
          htmlUrl: r.html_url,
          homepage: r.homepage && r.homepage.trim() ? r.homepage.trim() : null,
          tech,
          stars: r.stargazers_count,
          pushedAt: r.pushed_at,
        };
      })
      // Rank by client-impressiveness, not raw stars: a deployed demo and a
      // real description matter far more than a self-star. Live-demo'd,
      // described projects lead; ties break by most-recently pushed.
      .sort((a, b) => {
        const score = (r: ShowcaseRepo) =>
          (r.homepage ? 1000 : 0) +
          (r.description ? 200 : 0) +
          Math.min(r.stars, 20) * 10;
        return (
          score(b) - score(a) ||
          new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime()
        );
      })
      .slice(0, this.showcaseMax);
  }

  /**
   * Scan every configured repo for things a maintenance agent would act on:
   * stale issues, open PRs awaiting review, and untriaged (unlabelled) issues.
   * Pure read. Returns a flat, capped list of findings.
   */
  async maintenanceScan(limit = 12): Promise<MaintenanceFinding[]> {
    if (!this.configured() || this.repos.length === 0) return [];
    const findings: MaintenanceFinding[] = [];
    const staleBefore = Date.now() - this.staleDays * 86_400_000;

    for (const ref of this.repos) {
      try {
        const issues = await this.gh<GhIssue[]>(
          `/repos/${ref.fullName}/issues?state=open&per_page=50&sort=updated&direction=asc`,
        );
        for (const it of issues) {
          if (it.pull_request) {
            if (it.draft) continue;
            findings.push({
              repo: ref.fullName,
              kind: "open_pr",
              title: `PR #${it.number}: ${it.title}`,
              detail: "Open pull request awaiting review.",
              url: it.html_url,
              suggestedAction: "github.pr.review",
            });
            continue;
          }
          const untriaged = it.labels.length === 0;
          const stale = new Date(it.updated_at).getTime() < staleBefore;
          if (untriaged) {
            findings.push({
              repo: ref.fullName,
              kind: "untriaged_issue",
              title: `Issue #${it.number}: ${it.title}`,
              detail: "Unlabelled issue — needs triage.",
              url: it.html_url,
              suggestedAction: "github.issue.triage",
            });
          } else if (stale) {
            findings.push({
              repo: ref.fullName,
              kind: "stale_issue",
              title: `Issue #${it.number}: ${it.title}`,
              detail: `No activity in ${this.staleDays}+ days.`,
              url: it.html_url,
              suggestedAction: "github.issue.comment",
            });
          }
        }
      } catch (err) {
        this.logger.warn(`scan ${ref.fullName} failed: ${String(err)}`);
      }
    }
    return findings.slice(0, limit);
  }

  // ── Approved write executors (called only after Brain approval) ─────────

  async commentOnIssue(repo: string, issueNumber: number, body: string) {
    return this.gh(`/repos/${repo}/issues/${issueNumber}/comments`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
  }

  async createIssue(repo: string, title: string, body: string) {
    return this.gh(`/repos/${repo}/issues`, {
      method: "POST",
      body: JSON.stringify({ title, body }),
    });
  }
}
