import { apiFetch } from "@/lib/api";
import { handleFor, actionVerb, timeAgo } from "@/lib/format";
import { agentMeta, actionMeta } from "@/lib/agentMeta";
import type { AgentAnalytics, AgentDetail } from "@/lib/types";
import { ColumnHeader } from "@/components/x/ColumnHeader";
import { TabBar } from "@/components/x/TabBar";
import { TimelineRow } from "@/components/x/Feed";
import { AgentAvatar } from "@/components/x/Avatar";
import { StatusPill } from "@/components/x/StatusPill";
import { Badge } from "@/components/ui";
import { Chip } from "@/components/x/Chip";

export const dynamic = "force-dynamic";

export default async function AgentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const tab = (await searchParams).tab ?? "activity";

  const [agent, analytics] = await Promise.all([
    apiFetch<AgentDetail>(`/agents/${id}`),
    apiFetch<AgentAnalytics>("/agents/analytics").catch(() => null),
  ]);
  const stats = analytics?.agents.find((a) => a.id === id);
  const { color } = agentMeta(agent.type);

  return (
    <>
      <ColumnHeader
        title={agent.name}
        subtitle={handleFor(agent.type)}
        backHref="/agents"
        action={<StatusPill status={agent.status} />}
      />

      {/* profile header */}
      <div
        className="h-24 w-full"
        style={{ background: `linear-gradient(120deg, ${color}55, ${color}10)` }}
      />
      <div className="px-4 pb-3">
        <div className="-mt-9 mb-2">
          <span className="inline-block rounded-full ring-4 ring-x-bg">
            <AgentAvatar type={agent.type} size={72} />
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <h2 className="text-xl font-extrabold text-x-text">{agent.name}</h2>
          <span className="text-x-muted">{handleFor(agent.type)}</span>
        </div>
        <p className="mt-1 text-[15px] text-x-text">{agent.role}</p>
        {agent.description && (
          <p className="mt-1 text-[15px] text-x-muted">{agent.description}</p>
        )}

        <div className="mt-3 flex gap-5 text-sm">
          <span>
            <span className="font-bold text-x-text">
              {stats?.totalActions ?? 0}
            </span>{" "}
            <span className="text-x-muted">Actions</span>
          </span>
          <span>
            <span className="font-bold text-x-text">
              {agent.permissions.length}
            </span>{" "}
            <span className="text-x-muted">Capabilities</span>
          </span>
          <span className="text-x-muted">
            {agent.lastActiveAt ? `active ${timeAgo(agent.lastActiveAt)}` : "idle"}
          </span>
        </div>

        {/* capabilities */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {agent.permissions.map((p) => {
            const m = actionMeta(p);
            return <Chip key={p} label={m.label} color={m.color} />;
          })}
        </div>
      </div>

      <TabBar
        tabs={[
          { key: "activity", label: "Activity" },
          { key: "tasks", label: `Tasks (${agent.tasks.length})` },
        ]}
        active={tab}
        basePath={`/agents/${id}`}
      />

      {tab === "tasks" ? (
        agent.tasks.length === 0 ? (
          <p className="p-8 text-center text-sm text-x-muted">No tasks assigned.</p>
        ) : (
          agent.tasks.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between gap-3 border-b border-x-border px-4 py-3"
            >
              <div className="min-w-0">
                <div className="truncate text-[15px] text-x-text">{t.title}</div>
                <div className="text-xs text-x-muted">
                  {t.priority} · updated {timeAgo(t.updatedAt)}
                </div>
              </div>
              <Badge>{t.status}</Badge>
            </div>
          ))
        )
      ) : !stats || stats.recentActions.length === 0 ? (
        <p className="p-8 text-center text-sm text-x-muted">No activity yet.</p>
      ) : (
        stats.recentActions.map((r, i) => {
          const m = actionMeta(r.action);
          return (
            <TimelineRow
              key={i}
              avatar={<AgentAvatar type={agent.type} size={40} />}
              name={agent.name}
              handle={handleFor(agent.type)}
              time={timeAgo(r.createdAt)}
              chip={<Chip label={m.label} color={m.color} />}
            >
              <span className="text-x-text">{actionVerb(r.action)}</span>
              {r.entity && <span className="text-x-muted"> · {r.entity}</span>}
            </TimelineRow>
          );
        })
      )}
    </>
  );
}
