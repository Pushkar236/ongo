import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui";
import { inr, handleFor } from "@/lib/format";
import type { Opportunity } from "@/lib/types";
import { ColumnHeader } from "@/components/x/ColumnHeader";
import { TimelineRow } from "@/components/x/Feed";
import { AgentAvatar } from "@/components/x/Avatar";

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage() {
  const opportunities = await apiFetch<Opportunity[]>("/opportunities");

  return (
    <>
      <ColumnHeader
        title="Opportunities"
        subtitle="Markets surfaced by Research — ranked by demand"
      />

      {opportunities.length === 0 ? (
        <p className="p-8 text-center text-sm text-x-muted">
          No opportunities yet. The Research agent will surface them here.
        </p>
      ) : (
        opportunities.map((o) => (
          <TimelineRow
            key={o.id}
            avatar={<AgentAvatar type={o.sourceAgent?.type} size={40} />}
            name={o.title}
            handle={o.sourceAgent ? handleFor(o.sourceAgent.type) : undefined}
            chip={<Badge>{o.status}</Badge>}
          >
            <div className="text-[13px] text-x-muted">
              {o.market}
              {o.sourceAgent ? ` · found by ${o.sourceAgent.name}` : ""}
            </div>
            {o.recommendation && (
              <p className="mt-1 text-[15px] text-x-text">{o.recommendation}</p>
            )}
            <div className="mt-3 flex items-center gap-4">
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between text-xs text-x-muted">
                  <span>Demand</span>
                  <span className="font-semibold text-x-text">
                    {o.demandScore}/100
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-x-blue"
                    style={{ width: `${Math.min(100, o.demandScore)}%` }}
                  />
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-bold text-x-blue">
                  {inr(o.estRevenue)}
                </div>
                <div className="text-[10px] uppercase tracking-wide text-x-muted">
                  est. revenue
                </div>
              </div>
              <Badge>{o.competition}</Badge>
            </div>
          </TimelineRow>
        ))
      )}
    </>
  );
}
