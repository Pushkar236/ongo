import { Cpu } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { actionVerb, handleFor, timeAgo } from "@/lib/format";
import { agentMeta } from "@/lib/agentMeta";
import type { AgentAnalytics, AutonomyStatus } from "@/lib/types";
import { AgentAvatar } from "./Avatar";
import { StatusPill } from "./StatusPill";
import { AutoRefresh } from "./AutoRefresh";

/**
 * The "agents working" visualization: a central Brain node fanning out to the
 * 7 agents. WORKING agents glow + pulse and their connector animates, so the
 * founder can literally watch a cycle flow through the workforce. Hand-rolled
 * (no graph lib) — the topology is fixed, so CSS does the work. Self-refreshes.
 */
export async function AgentsLive() {
  const [analytics, status] = await Promise.all([
    apiFetch<AgentAnalytics>("/agents/analytics").catch(() => null),
    apiFetch<AutonomyStatus>("/autonomy/status").catch(() => null),
  ]);
  const agents = analytics?.agents ?? [];
  const workingCount = agents.filter((a) => a.status === "WORKING").length;

  return (
    <div className="border-b border-x-border p-4">
      <AutoRefresh interval={8000} />

      {/* Brain node */}
      <div className="relative mx-auto mb-4 flex max-w-sm items-center gap-3 rounded-2xl border border-x-blue/40 bg-x-blue/10 px-4 py-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-x-blue/20">
          <Cpu className="h-5 w-5 text-x-blue" />
        </span>
        <div className="min-w-0">
          <div className="text-sm font-bold text-x-text">OnGo Brain</div>
          <div className="text-xs text-x-muted">
            {status?.enabled ? "Engine running" : "Engine idle"} ·{" "}
            {status?.tickCount ?? 0} cycles
          </div>
        </div>
        <span className="ml-auto text-right">
          <span className="block text-lg font-bold leading-none text-x-blue">
            {workingCount}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-x-muted">
            working
          </span>
        </span>
      </div>

      {/* Agent fan-out */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {agents.map((a) => {
          const working = a.status === "WORKING";
          const { color } = agentMeta(a.type);
          const last = a.recentActions?.[0];
          return (
            <div
              key={a.id}
              className="relative rounded-xl border bg-x-surface p-3 transition"
              style={{
                borderColor: working ? color : "var(--color-x-border)",
                boxShadow: working ? `0 0 0 1px ${color}, 0 0 18px ${color}40` : "none",
              }}
            >
              {/* connector stub up to the brain bus */}
              <span
                className={`absolute -top-2 left-1/2 h-2 w-px -translate-x-1/2 ${working ? "x-pulse" : ""}`}
                style={{ backgroundColor: working ? color : "var(--color-x-border)" }}
              />
              <div className="flex items-center gap-2">
                <span className={working ? "x-pulse" : ""}>
                  <AgentAvatar type={a.type} size={34} />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-xs font-bold text-x-text">
                    {a.name}
                  </div>
                  <div className="truncate text-[11px] text-x-muted">
                    {handleFor(a.type)}
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <StatusPill status={a.status} />
              </div>
              <div className="mt-1.5 truncate text-[11px] text-x-muted">
                {last
                  ? `${actionVerb(last.action)} · ${timeAgo(last.createdAt)}`
                  : "no activity yet"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
