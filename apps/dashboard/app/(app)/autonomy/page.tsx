import { apiFetch } from "@/lib/api";
import AutonomyControls from "@/components/AutonomyControls";
import { Badge, Card, PageHeader, StatCard } from "@/components/ui";
import { timeAgo } from "@/lib/format";
import type { AutonomyStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

// The accurate active provider chain comes from agentRunner (reflects live
// DB-driven overrides); llm.providers only sees env, so prefer agentRunner.
function activeProviders(
  agentRunner?: string,
  llm?: { providers?: string[] },
): string[] {
  if (agentRunner?.startsWith("FallbackChain[")) {
    return agentRunner
      .slice("FallbackChain[".length, -1)
      .split(" -> ")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (agentRunner && agentRunner !== "MockAgentRunner") return [agentRunner];
  return llm?.providers ?? [];
}

function CycleRow({
  label,
  ok,
  text,
}: {
  label: string;
  ok: boolean;
  text?: string;
}) {
  return (
    <li className="flex items-start justify-between gap-3">
      <span className="flex items-center gap-2 text-slate-400">
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${ok ? "bg-emerald-400" : "bg-slate-600"}`}
        />
        {label}
      </span>
      <span className="min-w-0 text-right text-white">{text || "—"}</span>
    </li>
  );
}

export default async function AutonomyPage() {
  const s = await apiFetch<AutonomyStatus>("/autonomy/status");
  const minutes = Math.round(s.intervalMs / 60000);
  const report = s.lastReport;
  const providers = activeProviders(s.agentRunner, s.llm);

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
          <h2 className="mb-4 font-semibold text-white">
            Last cycle — what the agents did
          </h2>
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
              <CycleRow
                label="Discovery"
                ok={report.discovery.ran}
                text={report.discovery.summary ?? (report.discovery.ran ? "ran" : "skipped")}
              />
              <CycleRow
                label="Showcase sync"
                ok={!!report.showcase?.synced}
                text={
                  report.showcase
                    ? `${report.showcase.repos} repos · ${report.showcase.featured} featured`
                    : "—"
                }
              />
              <CycleRow
                label="Profile README"
                ok={!!report.profile?.updated}
                text={
                  report.profile
                    ? report.profile.updated
                      ? "updated"
                      : report.profile.reason ?? "no change"
                    : "—"
                }
              />
              <CycleRow
                label="New project (incubator)"
                ok={!!report.incubator?.created}
                text={
                  report.incubator?.created
                    ? `created ${report.incubator.repo}`
                    : report.incubator?.reason ?? "—"
                }
              />
              <CycleRow
                label="Development (code commit)"
                ok={!!report.development?.committed}
                text={
                  report.development?.committed
                    ? `${report.development.repo} · ${report.development.file}`
                    : report.development?.reason ?? "—"
                }
              />
              {report.errors.length > 0 && (
                <li className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  {report.errors.join("; ")}
                </li>
              )}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-3 font-semibold text-white">AI providers</h2>
            <p className="text-xs text-slate-500">
              Live LLM fallback chain — work rolls to the next on rate-limit.
            </p>
            {providers.length > 0 ? (
              <ol className="mt-3 space-y-1.5">
                {providers.map((p, i) => (
                  <li
                    key={`${p}-${i}`}
                    className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-sm text-white"
                  >
                    <span className="text-xs text-slate-500">{i + 1}.</span>
                    <span className="truncate">{p}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 text-sm text-slate-400">mock runner</p>
            )}
            <p className="mt-3 text-xs text-slate-500">
              Cycle every {minutes} min ·{" "}
              {s.incubator?.enabled
                ? `incubator on (max ${s.incubator.max})`
                : "incubator off"}
            </p>
          </Card>

          <Card>
            <h2 className="mb-3 font-semibold text-white">GitHub</h2>
            {s.github.connected ? (
              <p className="text-sm text-emerald-300">
                Connected — maintaining your repos + profile.
              </p>
            ) : (
              <p className="text-sm text-amber-300">
                Not connected — set <code className="text-brand-cyan">GITHUB_TOKEN</code>.
              </p>
            )}
          </Card>
        </div>
      </div>

      <p className="mt-6 text-xs text-slate-600">
        Runs 24/7 on Render with free, live LLMs. Every action is gated by the
        approval policy and written to the immutable activity log.
      </p>
    </>
  );
}
