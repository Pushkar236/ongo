import { User } from "lucide-react";
import { apiFetch } from "@/lib/api";
import ConvertLead from "@/components/ConvertLead";
import { Badge } from "@/components/ui";
import { timeAgo } from "@/lib/format";
import type { Lead } from "@/lib/types";
import { ColumnHeader } from "@/components/x/ColumnHeader";
import { TimelineRow } from "@/components/x/Feed";
import { Avatar } from "@/components/x/Avatar";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const leads = await apiFetch<Lead[]>("/leads");
  const open = leads.filter(
    (l) => l.status !== "CONVERTED" && l.status !== "REJECTED",
  );

  return (
    <>
      <ColumnHeader
        title="Leads"
        subtitle={`${open.length} open · ${leads.length - open.length} closed`}
      />

      {leads.length === 0 ? (
        <p className="p-8 text-center text-sm text-x-muted">
          No leads yet. Requests from the marketplace land here.
        </p>
      ) : (
        leads.map((l) => (
          <TimelineRow
            key={l.id}
            avatar={
              <Avatar size={40} color="#536471">
                {(l.contactName ?? "?")[0]?.toUpperCase() ?? <User className="h-5 w-5" />}
              </Avatar>
            }
            name={l.contactName ?? "Anonymous"}
            handle={l.contactEmail ?? undefined}
            time={timeAgo(l.createdAt)}
            chip={
              <span className="flex gap-1.5">
                <Badge>{l.type}</Badge>
                <Badge>{l.status}</Badge>
              </span>
            }
            actions={l.status !== "CONVERTED" ? <ConvertLead id={l.id} /> : undefined}
          >
            {l.request?.message && (
              <p className="text-[15px] text-x-text">{l.request.message}</p>
            )}
            {l.opportunity && (
              <p className="mt-1 text-xs text-x-green">
                → converted to opportunity: {l.opportunity.title}
              </p>
            )}
          </TimelineRow>
        ))
      )}
    </>
  );
}
