import { Cpu, User } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { actionVerb, handleFor, timeAgo } from "@/lib/format";
import { actionMeta } from "@/lib/agentMeta";
import type { ActivityItem, Agent } from "@/lib/types";
import { ColumnHeader } from "@/components/x/ColumnHeader";
import { TabBar } from "@/components/x/TabBar";
import { TimelineRow } from "@/components/x/Feed";
import { AgentAvatar, Avatar } from "@/components/x/Avatar";
import { Chip } from "@/components/x/Chip";
import { AutoRefresh } from "@/components/x/AutoRefresh";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "all", label: "All" },
  { key: "agents", label: "Agents" },
  { key: "system", label: "System" },
];

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const tab = (await searchParams).tab ?? "all";
  const [activity, agents] = await Promise.all([
    apiFetch<ActivityItem[]>("/activity?limit=60"),
    apiFetch<Agent[]>("/agents").catch(() => [] as Agent[]),
  ]);
  const typeByName = new Map(agents.map((a) => [a.name, a.type]));

  const items = activity.filter((i) =>
    tab === "agents"
      ? i.actorType === "AGENT"
      : tab === "system"
        ? i.actorType !== "AGENT"
        : true,
  );

  return (
    <>
      <ColumnHeader title="Activity" subtitle="Every action, as it happens">
        <TabBar tabs={TABS} active={tab} basePath="/activity" />
      </ColumnHeader>
      <AutoRefresh interval={10000} />

      {items.length === 0 ? (
        <p className="p-8 text-center text-sm text-x-muted">No activity yet.</p>
      ) : (
        items.map((item) => {
          const m = actionMeta(item.action);
          const isAgent = item.actorType === "AGENT";
          const type = isAgent ? typeByName.get(item.actorName ?? "") : null;
          return (
            <TimelineRow
              key={item.id}
              avatar={
                isAgent ? (
                  <AgentAvatar type={type} size={40} />
                ) : item.actorType === "HUMAN" ? (
                  <Avatar size={40} color="#536471">
                    <User className="h-5 w-5" />
                  </Avatar>
                ) : (
                  <Avatar size={40} color="#16181c">
                    <Cpu className="h-5 w-5 text-x-muted" />
                  </Avatar>
                )
              }
              name={item.actorName ?? "System"}
              handle={isAgent ? handleFor(type) : `@${item.actorType.toLowerCase()}`}
              time={timeAgo(item.createdAt)}
              chip={<Chip label={m.label} color={m.color} />}
            >
              <span className="text-x-text">{actionVerb(item.action)}</span>
              {item.entity && (
                <span className="text-x-muted"> · {item.entity}</span>
              )}
            </TimelineRow>
          );
        })
      )}
    </>
  );
}
