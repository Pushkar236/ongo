import { apiFetch } from "@/lib/api";
import AutonomyControls from "@/components/AutonomyControls";
import { Badge, Card, StatCard } from "@/components/ui";
import { timeAgo } from "@/lib/format";
import type { AutonomyStatus } from "@/lib/types";
import { ColumnHeader } from "@/components/x/ColumnHeader";
import { AgentsLive } from "@/components/x/AgentsLive";

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

function CycleRow({ label, ok, text }: { label: string; ok: boolean; text?: string }) {
  return (
    <li className="flex items-start justify-between gap-3">
      <span className="flex items-center gap-2 text-x-muted">
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${ok ? "bg-x-green" : "bg-x-border"}`}
        />
        {label}
      </span>
      <span className="min-w-0 text-right text-x-text">{text || "—"}</span>
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
      <ColumnHeader
        title="Autonomy Engine"
        subtitle="The 24/7 loop — watch it work"
        action={<AutonomyControls enabled={s.enabled} />}
      />

      {/* Live agents view (self-refreshing) */}
      <AgentsLive />

      <div className="grid grid-cols-2 gap-3 border-b border-x-border p-4 sm:grid-cols-4">
        <StatCard
          label="Engine"
          value={s.enabled ? "On" : "Off"}
          accent={s.enabled ? "green" : "amber"}
          hint={s.running ? "cycle running…" : `every ${minutes} min`}
        />
        <StatCard label="Cycles run" value={s.tickCount} accent="purple" />
        <StatCard
          label="GitHub"
          value={s.github.connected ? "Connected" : "Not set"}
          accent={s.github.connected ? "green" : "amber"}
          hint={s.github.connected ? `${s.github.repos.length} repo(s)` : "no token"}
        />
        <StatCard
          label="Last cycle"
          value={s.lastTickAt ? timeAgo(s.lastTickAt) : "never"}
          accent="blue"
        />
      </div>

      <div className="space-y-4 p-4">
        <Card>
          <h2 className="mb-4 font-bold text-x-text">Last cycle — what the agents did</h2>
          {!report ? (
            <p className="text-sm text-x-muted">
              No cycle has run yet. Hit “Run Cycle” to trigger one now.
            </p>
          ) : (
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <span className="text-x-muted">Trigger</span>
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
                <li className="rounded-lg bg-x-red/10 px-3 py-2 text-xs text-x-red">
                  {report.errors.join("; ")}
                </li>
              )}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 font-bold text-x-text">AI providers</h2>
          <p className="text-xs text-x-muted">
            Live LLM fallback chain — work rolls to the next on rate-limit.
          </p>
          {providers.length > 0 ? (
            <ol className="mt-3 space-y-1.5">
              {providers.map((p, i) => (
                <li
                  key={`${p}-${i}`}
                  className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-sm text-x-text"
                >
                  <span className="text-xs text-x-muted">{i + 1}.</span>
                  <span className="truncate">{p}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-sm text-x-muted">mock runner</p>
          )}
          <p className="mt-3 text-xs text-x-muted">
            Cycle every {minutes} min ·{" "}
            {s.incubator?.enabled
              ? `incubator on (max ${s.incubator.max})`
              : "incubator off"}
          </p>
        </Card>
      </div>
    </>
  );
}
