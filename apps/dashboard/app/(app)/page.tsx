import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Badge, Card, PageHeader, StatCard } from "@/components/ui";
import { inr, timeAgo } from "@/lib/format";
import type { ActivityItem, Approval, Overview } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const [overview, approvals, activity] = await Promise.all([
    apiFetch<Overview>("/dashboard/overview"),
    apiFetch<Approval[]>("/approvals?status=PENDING"),
    apiFetch<ActivityItem[]>("/activity?limit=8"),
  ]);

  return (
    <>
      <PageHeader
        title="Command Center"
        subtitle="Your agency at a glance. Agents do the work; you make the decisions."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Active Projects" value={overview.activeProjects} accent="blue" />
        <StatCard label="Active Agents" value={overview.activeAgents} accent="cyan" />
        <StatCard label="Open Tasks" value={overview.openTasks} accent="purple" />
        <StatCard
          label="Pending Approvals"
          value={overview.pendingApprovals}
          accent="amber"
          hint={overview.pendingApprovals > 0 ? "needs your decision" : "all clear"}
        />
        <StatCard label="Deploys Today" value={overview.deploymentsToday} accent="cyan" />
        <StatCard label="New Opportunities" value={overview.newOpportunities} accent="purple" />
        <StatCard
          label="New Leads"
          value={overview.newLeads}
          accent="cyan"
          hint={overview.newLeads > 0 ? "from the marketplace" : undefined}
        />
        <StatCard
          label="Total Revenue"
          value={inr(overview.totalRevenue)}
          accent="blue"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-white">Pending Approvals</h2>
            <Link href="/approvals" className="text-xs text-brand-cyan hover:underline">
              View all →
            </Link>
          </div>
          {approvals.length === 0 ? (
            <p className="text-sm text-slate-500">Nothing waiting on you. 🎉</p>
          ) : (
            <ul className="space-y-3">
              {approvals.slice(0, 5).map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.03] px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm text-white">{a.title}</div>
                    <div className="text-xs text-slate-500">
                      {a.requestedByAgent?.name ?? "system"} · {a.actionType}
                    </div>
                  </div>
                  <Badge>{a.riskLevel}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-white">Agent Activity</h2>
            <Link href="/activity" className="text-xs text-brand-cyan hover:underline">
              View all →
            </Link>
          </div>
          <ul className="space-y-3">
            {activity.map((item) => (
              <li key={item.id} className="flex items-start gap-3 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-cyan" />
                <div className="min-w-0">
                  <span className="text-white">{item.actorName ?? "system"}</span>{" "}
                  <span className="text-slate-400">{item.action}</span>
                  <div className="text-xs text-slate-600">
                    {timeAgo(item.createdAt)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
