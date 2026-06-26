import { apiFetch } from "@/lib/api";
import RunPipeline from "@/components/RunPipeline";
import { Badge, Card } from "@/components/ui";
import { handleFor, timeAgo } from "@/lib/format";
import type { Pipeline, WorkflowRun } from "@/lib/types";
import { ColumnHeader } from "@/components/x/ColumnHeader";
import { AgentAvatar } from "@/components/x/Avatar";

export const dynamic = "force-dynamic";

const stepColor = (status: string) =>
  status === "executed"
    ? "var(--color-x-green)"
    : status === "pending_approval"
      ? "var(--color-x-amber)"
      : "var(--color-x-red)";

export default async function WorkflowsPage() {
  const [catalog, runs] = await Promise.all([
    apiFetch<Pipeline[]>("/workflows/catalog"),
    apiFetch<WorkflowRun[]>("/workflows"),
  ]);

  return (
    <>
      <ColumnHeader
        title="Workflows"
        subtitle="Chain specialist agents into pipelines"
      />

      <div className="grid gap-3 p-4 sm:grid-cols-2">
        {catalog.map((p) => (
          <Card key={p.key}>
            <h3 className="font-bold text-x-text">{p.name}</h3>
            <p className="mt-1 text-sm text-x-muted">{p.description}</p>
            <div className="mt-2 text-xs text-x-muted">{p.steps} agent steps</div>
            <div className="mt-4">
              <RunPipeline pipeline={p.key} />
            </div>
          </Card>
        ))}
      </div>

      <div className="px-4 py-3">
        <h2 className="font-bold text-x-text">Recent runs ({runs.length})</h2>
      </div>
      {runs.length === 0 ? (
        <p className="p-8 text-center text-sm text-x-muted">
          No runs yet — start one above.
        </p>
      ) : (
        <div className="space-y-3 px-4 pb-4">
          {runs.slice(0, 12).map((w) => (
            <Card key={w.id}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-bold text-x-text">{w.name}</span>
                  <span className="ml-2 text-xs text-x-muted">
                    {timeAgo(w.createdAt)}
                  </span>
                </div>
                <Badge>{w.status}</Badge>
              </div>
              {/* the agent chain */}
              <ol className="mt-3 space-y-2">
                {(w.steps ?? []).map((s, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <AgentAvatar type={s.agentType} size={28} />
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-semibold text-x-text">
                        {handleFor(s.agentType)}
                      </span>
                      <span className="ml-2 text-xs text-x-muted">
                        {s.actionType}
                      </span>
                      {s.summary && (
                        <div className="truncate text-xs text-x-muted">
                          {s.summary}
                        </div>
                      )}
                    </div>
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: stepColor(s.status) }}
                    />
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
