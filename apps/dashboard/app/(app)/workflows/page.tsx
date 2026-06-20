import { apiFetch } from "@/lib/api";
import RunPipeline from "@/components/RunPipeline";
import { Badge, Card, PageHeader } from "@/components/ui";
import { timeAgo } from "@/lib/format";
import type { Pipeline, WorkflowRun } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function WorkflowsPage() {
  const [catalog, runs] = await Promise.all([
    apiFetch<Pipeline[]>("/workflows/catalog"),
    apiFetch<WorkflowRun[]>("/workflows"),
  ]);

  return (
    <>
      <PageHeader
        title="Workflows"
        subtitle="Chain specialist agents into pipelines. Every step runs through the Brain — high-risk steps pause for your approval."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {catalog.map((p) => (
          <Card key={p.key}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-white">{p.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{p.description}</p>
                <div className="mt-2 text-xs text-slate-500">
                  {p.steps} agent steps
                </div>
              </div>
            </div>
            <div className="mt-4">
              <RunPipeline pipeline={p.key} />
            </div>
          </Card>
        ))}
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Recent runs ({runs.length})
      </h2>
      {runs.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500">No runs yet — start one above.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {runs.slice(0, 12).map((w) => (
            <Card key={w.id}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-semibold text-white">{w.name}</span>
                  <span className="ml-2 text-xs text-slate-500">
                    {timeAgo(w.createdAt)}
                  </span>
                </div>
                <Badge>{w.status}</Badge>
              </div>
              <ol className="mt-3 space-y-1.5">
                {(w.steps ?? []).map((s, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm text-slate-400"
                  >
                    <span
                      className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                        s.status === "executed"
                          ? "bg-emerald-400"
                          : s.status === "pending_approval"
                            ? "bg-amber-400"
                            : "bg-rose-400"
                      }`}
                    />
                    <span className="text-slate-300">{s.agentType}</span>
                    <span className="text-slate-500">{s.actionType}</span>
                    {s.summary && (
                      <span className="truncate text-slate-500">
                        — {s.summary}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
