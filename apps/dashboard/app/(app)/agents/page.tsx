import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { handleFor, actionVerb, timeAgo } from "@/lib/format";
import { agentMeta, actionMeta } from "@/lib/agentMeta";
import type { AgentAnalytics } from "@/lib/types";
import { ColumnHeader } from "@/components/x/ColumnHeader";
import { TabBar } from "@/components/x/TabBar";
import { AgentAvatar } from "@/components/x/Avatar";
import { StatusPill } from "@/components/x/StatusPill";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "all", label: "All" },
  { key: "working", label: "Working" },
  { key: "idle", label: "Idle" },
];

export default async function AgentsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const tab = (await searchParams).tab ?? "all";
  const { summary, agents } = await apiFetch<AgentAnalytics>("/agents/analytics");

  const list = agents.filter((a) =>
    tab === "working"
      ? a.status === "WORKING"
      : tab === "idle"
        ? a.status !== "WORKING"
        : true,
  );

  return (
    <>
      <ColumnHeader title="Agents" subtitle={`${agents.length} specialists · ${summary.totalAgentActions} actions`}>
        <TabBar tabs={TABS} active={tab} basePath="/agents" />
      </ColumnHeader>

      {list.map((a) => {
        const { color } = agentMeta(a.type);
        const max = Math.max(1, ...a.actionsByType.map((x) => x.count));
        return (
          <Link
            key={a.id}
            href={`/agents/${a.id}`}
            className="block border-b border-x-border x-row-hover"
          >
            {/* banner */}
            <div
              className="h-16 w-full"
              style={{
                background: `linear-gradient(120deg, ${color}40, ${color}10)`,
              }}
            />
            <div className="px-4 pb-4">
              <div className="-mt-7 mb-2 flex items-end justify-between">
                <span className="rounded-full ring-4 ring-x-bg">
                  <AgentAvatar type={a.type} size={56} />
                </span>
                <StatusPill status={a.status} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-x-text">{a.name}</span>
                <span className="text-sm text-x-muted">{handleFor(a.type)}</span>
              </div>
              <p className="mt-0.5 text-[15px] text-x-text">{a.role}</p>
              {a.description && (
                <p className="mt-1 text-[13px] text-x-muted">{a.description}</p>
              )}

              {/* stat row */}
              <div className="mt-3 flex gap-5 text-sm">
                <span>
                  <span className="font-bold text-x-text">{a.totalActions}</span>{" "}
                  <span className="text-x-muted">Actions</span>
                </span>
                <span>
                  <span className="font-bold text-x-text">
                    {a.actionsByType.length}
                  </span>{" "}
                  <span className="text-x-muted">Skills</span>
                </span>
                <span className="text-x-muted">
                  {a.lastActiveAt ? `active ${timeAgo(a.lastActiveAt)}` : "idle"}
                </span>
              </div>

              {/* workload meters */}
              {a.actionsByType.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {a.actionsByType.slice(0, 4).map((x) => {
                    const m = actionMeta(x.action);
                    return (
                      <div key={x.action} className="flex items-center gap-3">
                        <div className="w-32 shrink-0 truncate text-xs text-x-muted">
                          {m.label}
                        </div>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(x.count / max) * 100}%`,
                              backgroundColor: m.color,
                            }}
                          />
                        </div>
                        <div className="w-6 shrink-0 text-right text-xs font-semibold text-x-text">
                          {x.count}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* latest */}
              {a.recentActions.length > 0 && (
                <div className="mt-3 text-xs text-x-muted">
                  Latest: {actionVerb(a.recentActions[0].action)} ·{" "}
                  {timeAgo(a.recentActions[0].createdAt)}
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </>
  );
}
