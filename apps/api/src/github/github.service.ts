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
  }

  configured(): boolean {
    return Boolean(this.token);
  }

  configuredRepos(): RepoRef[] {
    return this.repos;
  }

  status() {
    return {
      connected: this.configured(),
      repos: this.repos.map((r) => r.fullName),
      staleDays: this.staleDays,
    };
  }

  private async gh<T>(path: string, init?: RequestInit): Promise<T> {
    if (!this.token) throw new Error("GITHUB_TOKEN not configured");
    const res = await fetch(`https://api.github.com${path}`, {
      ...init,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${this.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "ongo-brain",
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
