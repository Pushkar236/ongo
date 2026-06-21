import { apiFetch } from "@/lib/api";
import AutonomyControls from "@/components/AutonomyControls";
import { Badge, Card, PageHeader, StatCard } from "@/components/ui";
import { timeAgo } from "@/lib/format";
import type { AutonomyStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AutonomyPage() {
  const s = await apiFetch<AutonomyStatus>("/autonomy/status");
  const minutes = Math.round(s.intervalMs / 60000);
  const report = s.lastReport;

  return (
    <>
      <PageHeader
        title="Autonomy Engine"
        subtitle="The 24/7 loop. On each cycle it scans the market for opportunities and maintains your connected GitHub — every action still gated by your approval policy."
      />

      <div className="mb-6">
        <AutonomyControls enabled={s.enabled} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Engine"
          value={s.enabled ? "On" : "Off"}
          accent={s.enabled ? "cyan" : "amber"}
          hint={s.running ? "cycle running…" : `every ${minutes} min`}
        />
        <StatCard label="Cycles run" value={s.tickCount} accent="purple" />
        <StatCard
          label="GitHub"
          value={s.github.connected ? "Connected" : "Not set"}
          accent={s.github.connected ? "cyan" : "amber"}
          hint={
            s.github.connected ? `${s.github.repos.length} repo(s)` : "no token"
          }
        />
        <StatCard
          label="Last cycle"
          value={s.lastTickAt ? timeAgo(s.lastTickAt) : "never"}
          accent="blue"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-semibold text-white">Last cycle report</h2>
          {!report ? (
            <p className="text-sm text-slate-500">
              No cycle has run yet. Hit “Run one cycle” to trigger one now.
            </p>
          ) : (
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <span className="text-slate-400">Trigger</span>
                <Badge>{report.trigger}</Badge>
              </li>
              <li className="flex items-start justify-between gap-3">
                <span className="text-slate-400">Discovery</span>
                <span className="min-w-0 text-right text-white">
                  {report.discovery.ran
                    ? report.discovery.summary ?? "ran"
                    : "skipped"}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-400">GitHub findings</span>
                <span className="text-white">
                  {report.github.scanned
                    ? `${report.github.findings} found · ${report.github.tasksOpened} task(s) opened`
                    : "not scanned"}
                </span>
              </li>
              {report.errors.length > 0 && (
                <li className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  {report.errors.join("; ")}
                </li>
              )}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold text-white">Connected repos</h2>
          {s.github.connected ? (
            s.github.repos.length === 0 ? (
              <p className="text-sm text-slate-500">
                Token set, but no repos listed. Add{" "}
                <code className="text-brand-cyan">GITHUB_REPOS</code> (comma-
                separated <code className="text-brand-cyan">owner/repo</code>).
              </p>
            ) : (
              <ul className="space-y-2">
                {s.github.repos.map((r) => (
                  <li
                    key={r}
                    className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-sm text-white"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {r}
                  </li>
                ))}
              </ul>
            )
          ) : (
            <div className="text-sm text-slate-400">
              <p className="mb-2">
                GitHub isn’t connected. To let the engine maintain your repos,
                set in <code className="text-brand-cyan">.env</code>:
              </p>
              <pre className="overflow-x-auto rounded-lg bg-black/40 p-3 text-xs text-slate-300">
                {`GITHUB_TOKEN=ghp_…\nGITHUB_REPOS=you/repo-a,you/repo-b`}
              </pre>
            </div>
          )}
        </Card>
      </div>

      <p className="mt-6 text-xs text-slate-600">
        True 24/7 requires the API to run on an always-on host (Railway / Render
        / Fly), and live agent reasoning requires a metered{" "}
        <code className="text-slate-500">ANTHROPIC_API_KEY</code>. Until then the
        loop runs on the mock runner with real GitHub reads.
      </p>
    </>
  );
}
