import { apiFetch } from "@/lib/api";
import { Badge, Card, PageHeader } from "@/components/ui";
import type { Agent } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const agents = await apiFetch<Agent[]>("/agents");

  return (
    <>
      <PageHeader
        title="Agents"
        subtitle="Your specialist workforce. Each has explicit permissions — deny-by-default."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((a) => (
          <Card key={a.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-white">{a.name}</h3>
                <div className="text-xs text-slate-500">{a.role}</div>
              </div>
              <Badge>{a.status}</Badge>
            </div>
            {a.description && (
              <p className="mt-3 text-sm text-slate-400">{a.description}</p>
            )}
            <div className="mt-4">
              <div className="mb-1 text-[10px] uppercase tracking-wide text-slate-500">
                Permitted actions
              </div>
              <div className="flex flex-wrap gap-1.5">
                {a.permissions.map((p) => (
                  <span
                    key={p}
                    className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-slate-300 ring-1 ring-white/10"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
