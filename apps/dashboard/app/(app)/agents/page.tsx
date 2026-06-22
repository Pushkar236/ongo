import { apiFetch } from "@/lib/api";
import { Badge, Card, PageHeader, StatCard } from "@/components/ui";
import { timeAgo } from "@/lib/format";
import type { AgentAnalytics } from "@/lib/types";

export const dynamic = "force-dynamic";

// Friendly labels + colors for the action types the agents emit.
const ACTION_META: Record<string, { label: string; color: string }> = {
  "research.scan": { label: "Market scans", color: "bg-cyan-400" },
  "opportunity.create": { label: "Opportunities", color: "bg-cyan-400" },
  "github.repo.create": { label: "Repos created", color: "bg-purple-400" },
  "github.profile.update": { label: "Profile updates", color: "bg-blue-400" },
  "code.generate": { label: "Code commits", color: "bg-emerald-400" },
  "task.create": { label: "Tasks opened", color: "bg-amber-400" },
  "task.update": { label: "Task updates", color: "bg-amber-300" },
  "approval.request": { label: "Approvals requested", color: "bg-rose-400" },
  "permission.denied": { label: "Denied (no permission)", color: "bg-slate-500" },
  "deploy.production": { label: "Production deploys", color: "bg-emerald-400" },
  "deploy.feature": { label: "Feature deploys", color: "bg-emerald-300" },
};
const meta = (a: string) =>
  ACTION_META[a] ?? { label: a, color: "bg-white/40" };

export default async function AgentsPage() {
  const data = await apiFetch<AgentAnalytics>("/agents/analytics");
  const { summary, agents } = data;
  const totalsForBar = agents.map((a) => a.totalActions);
  const maxTotal = Math.max(1, ...totalsForBar);

  return (
    <>
      <PageHeader
        title="Agent Activity"
        subtitle="What your AI workforce has actually done — built from the immutable audit log, updated every cycle."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Agent actions" value={summary.totalAgentActions} accent="cyan" />
        <StatCard label="Opportunities" value={summary.opportunities} accent="blue" />
        <StatCard label="Projects" value={summary.projects} accent="purple" />
        <StatCard label="Incubated repos" value={summary.incubatedRepos} accent="purple" />
        <StatCard label="Code commits" value={summary.devCommits} accent="cyan" hint="by the dev agent" />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {agents.map((a) => {
          const max = Math.max(1, ...a.actionsByType.map((x) => x.count));
          return (
            <Card key={a.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-white">
                    {a.name}{" "}
                    <span className="text-xs font-normal text-slate-500">
                      · {a.role}
                    </span>
                  </h3>
                  <div className="mt-0.5 text-xs text-slate-500">
                    {a.lastActiveAt
                      ? `last active ${timeAgo(a.lastActiveAt)}`
                      : "idle"}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-right">
                    <span className="block text-2xl font-bold leading-none text-white">
                      {a.totalActions}
                    </span>
                    <span className="text-[10px] uppercase tracking-wide text-slate-500">
                      actions
                    </span>
                  </span>
                  <Badge>{a.status}</Badge>
                </div>
              </div>

              {/* Relative workload bar */}
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple"
                  style={{ width: `${(a.totalActions / maxTotal) * 100}%` }}
                />
              </div>

              {a.actionsByType.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {a.actionsByType.map((x) => {
                    const m = meta(x.action);
                    return (
                      <div key={x.action} className="flex items-center gap-3">
                        <div className="w-40 shrink-0 truncate text-xs text-slate-400">
                          {m.label}
                        </div>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                          <div
                            className={`h-full rounded-full ${m.color}`}
                            style={{ width: `${(x.count / max) * 100}%` }}
                          />
                        </div>
                        <div className="w-7 shrink-0 text-right text-xs font-medium text-white">
                          {x.count}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  No actions yet — waiting for its turn in the cycle.
                </p>
              )}

              {a.recentActions.length > 0 && (
                <div className="mt-4 border-t border-white/5 pt-3">
                  <div className="mb-2 text-[10px] uppercase tracking-wide text-slate-500">
                    Recent
                  </div>
                  <ul className="space-y-1.5">
                    {a.recentActions.map((r, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between gap-2 text-xs"
                      >
                        <span className="min-w-0 truncate text-slate-300">
                          {meta(r.action).label}
                          {r.entity ? (
                            <span className="text-slate-500"> · {r.entity}</span>
                          ) : null}
                        </span>
                        <span className="shrink-0 text-slate-600">
                          {timeAgo(r.createdAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}
