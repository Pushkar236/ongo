import Link from "next/link";
import { Search } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { handleFor, timeAgo } from "@/lib/format";
import type { AgentAnalytics, AutonomyStatus } from "@/lib/types";
import { AgentAvatar } from "./Avatar";
import { StatusPill } from "./StatusPill";

/** X "right column": search + system status + agent roster. Server component. */
export async function RightRail() {
  const [status, analytics] = await Promise.all([
    apiFetch<AutonomyStatus>("/autonomy/status").catch(() => null),
    apiFetch<AgentAnalytics>("/agents/analytics").catch(() => null),
  ]);

  return (
    <aside className="sticky top-0 hidden h-screen w-[350px] shrink-0 flex-col gap-4 overflow-y-auto px-6 py-3 xl:flex">
      {/* Search (visual, like X) */}
      <div className="flex items-center gap-3 rounded-full bg-x-surface px-4 py-2.5 text-x-muted">
        <Search className="h-4 w-4" />
        <span className="text-sm">Search</span>
      </div>

      {/* System status */}
      <div className="overflow-hidden rounded-2xl border border-x-border bg-x-surface">
        <div className="px-4 py-3 text-lg font-bold text-x-text">
          System status
        </div>
        <Row
          label="Engine"
          value={status?.enabled ? "Running" : "Idle"}
          good={status?.enabled}
        />
        <Row label="Cycles run" value={String(status?.tickCount ?? "—")} />
        <Row
          label="Last cycle"
          value={status?.lastTickAt ? timeAgo(status.lastTickAt) : "—"}
        />
        <Row
          label="GitHub"
          value={status?.github?.connected ? "Connected" : "Off"}
          good={status?.github?.connected}
        />
      </div>

      {/* Agent roster */}
      <div className="overflow-hidden rounded-2xl border border-x-border bg-x-surface">
        <div className="px-4 py-3 text-lg font-bold text-x-text">Your agents</div>
        {(analytics?.agents ?? []).map((a) => (
          <Link
            key={a.id}
            href={`/agents/${a.id}`}
            className="flex items-center gap-3 px-4 py-2.5 x-row-hover"
          >
            <AgentAvatar type={a.type} size={40} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-x-text">
                {a.name}
              </div>
              <div className="truncate text-xs text-x-muted">
                {handleFor(a.type)}
              </div>
            </div>
            <StatusPill status={a.status} />
          </Link>
        ))}
        <Link
          href="/agents"
          className="block px-4 py-3 text-sm text-x-blue x-row-hover"
        >
          Show more
        </Link>
      </div>

      <p className="px-2 text-xs text-x-muted">
        OnGo · agentic OS — agents do the work, you make the calls.
      </p>
    </aside>
  );
}

function Row({
  label,
  value,
  good,
}: {
  label: string;
  value: string;
  good?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 x-row-hover">
      <span className="text-sm text-x-muted">{label}</span>
      <span
        className={`text-sm font-semibold ${good ? "text-x-green" : "text-x-text"}`}
      >
        {value}
      </span>
    </div>
  );
}
