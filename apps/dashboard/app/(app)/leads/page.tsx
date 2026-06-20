import { apiFetch } from "@/lib/api";
import ConvertLead from "@/components/ConvertLead";
import { Badge, Card, PageHeader } from "@/components/ui";
import { timeAgo } from "@/lib/format";
import type { Lead } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const leads = await apiFetch<Lead[]>("/leads");
  const open = leads.filter((l) => l.status !== "CONVERTED" && l.status !== "REJECTED");

  return (
    <>
      <PageHeader
        title="Marketplace Leads"
        subtitle="Inbound project requests from the public site. Convert a lead into a tracked opportunity."
      />

      {leads.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500">
            No leads yet. Requests submitted on the marketplace land here.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {leads.map((l) => (
            <Card key={l.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">
                      {l.contactName ?? "Anonymous"}
                    </span>
                    <Badge>{l.type}</Badge>
                    <Badge>{l.status}</Badge>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {l.contactEmail ?? "no email"} · {l.source} ·{" "}
                    {timeAgo(l.createdAt)}
                  </div>
                  {l.request?.message && (
                    <p className="mt-2 max-w-2xl text-sm text-slate-400">
                      {l.request.message}
                    </p>
                  )}
                  {l.opportunity && (
                    <p className="mt-2 text-xs text-emerald-400">
                      → converted to opportunity: {l.opportunity.title}
                    </p>
                  )}
                </div>
                {l.status !== "CONVERTED" && <ConvertLead id={l.id} />}
              </div>
            </Card>
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-slate-600">
        {open.length} open · {leads.length - open.length} closed
      </p>
    </>
  );
}
