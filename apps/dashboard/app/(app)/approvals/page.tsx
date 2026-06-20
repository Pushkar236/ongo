import { apiFetch } from "@/lib/api";
import ApprovalActions from "@/components/ApprovalActions";
import { Badge, Card, PageHeader } from "@/components/ui";
import { timeAgo } from "@/lib/format";
import type { Approval } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const approvals = await apiFetch<Approval[]>("/approvals");
  const pending = approvals.filter((a) => a.status === "PENDING");
  const decided = approvals.filter((a) => a.status !== "PENDING");

  return (
    <>
      <PageHeader
        title="Approval Center"
        subtitle="Level-3 actions are blocked until you decide. Nothing high-risk ships without you."
      />

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Awaiting your decision ({pending.length})
      </h2>
      {pending.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500">No pending approvals. 🎉</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {pending.map((a) => (
            <Card key={a.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{a.title}</span>
                    <Badge>{a.level}</Badge>
                    <Badge>{a.riskLevel}</Badge>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {a.actionType} · requested by{" "}
                    {a.requestedByAgent?.name ?? "system"} · {timeAgo(a.createdAt)}
                  </div>
                  {a.impactAnalysis && (
                    <p className="mt-2 max-w-2xl text-sm text-slate-400">
                      {a.impactAnalysis}
                    </p>
                  )}
                </div>
                <ApprovalActions id={a.id} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-slate-400">
        History ({decided.length})
      </h2>
      <Card>
        {decided.length === 0 ? (
          <p className="text-sm text-slate-500">No decisions yet.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {decided.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm text-white">{a.title}</div>
                  <div className="text-xs text-slate-500">
                    {a.actionType} · {timeAgo(a.createdAt)}
                  </div>
                </div>
                <Badge>{a.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
