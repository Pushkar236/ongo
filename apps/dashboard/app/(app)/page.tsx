import Link from "next/link";
import { Cpu, User } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { StatCard } from "@/components/ui";
import { inr, actionVerb, handleFor, timeAgo } from "@/lib/format";
import { actionMeta } from "@/lib/agentMeta";
import type { ActivityItem, Agent, Approval, Overview } from "@/lib/types";
import { ColumnHeader } from "@/components/x/ColumnHeader";
import { AgentsLive } from "@/components/x/AgentsLive";
import { TimelineRow } from "@/components/x/Feed";
import { AgentAvatar, Avatar } from "@/components/x/Avatar";
import { Chip } from "@/components/x/Chip";
import { Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const [overview, approvals, activity, agents] = await Promise.all([
    apiFetch<Overview>("/dashboard/overview"),
    apiFetch<Approval[]>("/approvals?status=PENDING"),
    apiFetch<ActivityItem[]>("/activity?limit=15"),
    apiFetch<Agent[]>("/agents").catch(() => [] as Agent[]),
  ]);
  const typeByName = new Map(agents.map((a) => [a.name, a.type]));

  return (
    <>
      <ColumnHeader title="Home" subtitle="Your workforce, live" />

      {/* Hero: agents working */}
      <AgentsLive />

      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-3 border-b border-x-border p-4 sm:grid-cols-4">
        <StatCard label="Projects" value={overview.activeProjects} accent="blue" />
        <StatCard label="Agents" value={overview.activeAgents} accent="green" />
        <StatCard label="Open tasks" value={overview.openTasks} accent="purple" />
        <StatCard
          label="Approvals"
          value={overview.pendingApprovals}
          accent="amber"
        />
        <StatCard label="Opportunities" value={overview.newOpportunities} accent="blue" />
        <StatCard label="Leads" value={overview.newLeads} accent="cyan" />
        <StatCard label="Deploys today" value={overview.deploymentsToday} accent="green" />
        <StatCard label="Revenue" value={inr(overview.totalRevenue)} accent="blue" />
      </div>

      {/* Pending approvals preview */}
      {approvals.length > 0 && (
        <div className="border-b border-x-border">
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="font-bold text-x-text">Needs your decision</h2>
            <Link href="/approvals" className="text-sm text-x-blue hover:underline">
              View all
            </Link>
          </div>
          {approvals.slice(0, 3).map((a) => (
            <TimelineRow
              key={a.id}
              href="/approvals"
              avatar={<AgentAvatar type={a.requestedByAgent?.type} size={40} />}
              name={a.requestedByAgent?.name ?? "System"}
              handle={handleFor(a.requestedByAgent?.type)}
              time={timeAgo(a.createdAt)}
              chip={<Badge>{a.riskLevel}</Badge>}
            >
              {a.title}
            </TimelineRow>
          ))}
        </div>
      )}

      {/* Activity feed */}
      <div className="px-4 py-3">
        <h2 className="font-bold text-x-text">Latest activity</h2>
      </div>
      {activity.map((item) => {
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
            {item.entity && <span className="text-x-muted"> · {item.entity}</span>}
          </TimelineRow>
        );
      })}
    </>
  );
}
