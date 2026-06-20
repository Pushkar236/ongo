import { apiFetch } from "@/lib/api";
import { Badge, Card, PageHeader } from "@/components/ui";
import { inr } from "@/lib/format";
import type { Opportunity } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage() {
  const opportunities = await apiFetch<Opportunity[]>("/opportunities");

  return (
    <>
      <PageHeader
        title="Opportunities"
        subtitle="Markets surfaced by the Research agent — ranked by demand, sized by revenue."
      />
      {opportunities.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500">
            No opportunities yet. The Research agent will surface them here.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {opportunities.map((o) => (
            <Card key={o.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{o.title}</h3>
                    <Badge>{o.status}</Badge>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {o.market}
                    {o.sourceAgent ? ` · found by ${o.sourceAgent.name}` : ""}
                  </div>
                  {o.recommendation && (
                    <p className="mt-2 max-w-2xl text-sm text-slate-400">
                      {o.recommendation}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {o.demandScore}
                    </div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-500">
                      demand
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold gradient-text">
                      {inr(o.estRevenue)}
                    </div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-500">
                      est. revenue
                    </div>
                  </div>
                  <Badge>{o.competition}</Badge>
                </div>
              </div>
              {/* demand meter */}
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple"
                  style={{ width: `${Math.min(100, o.demandScore)}%` }}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
