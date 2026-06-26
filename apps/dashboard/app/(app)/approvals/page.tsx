import { apiFetch } from "@/lib/api";
import ApprovalActions from "@/components/ApprovalActions";
import { Badge } from "@/components/ui";
import { handleFor, timeAgo } from "@/lib/format";
import type { Approval } from "@/lib/types";
import { ColumnHeader } from "@/components/x/ColumnHeader";
import { TabBar } from "@/components/x/TabBar";
import { TimelineRow } from "@/components/x/Feed";
import { AgentAvatar } from "@/components/x/Avatar";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "history", label: "History" },
];

export default async function ApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const tab = (await searchParams).tab ?? "pending";
  const approvals = await apiFetch<Approval[]>("/approvals");
  const pending = approvals.filter((a) => a.status === "PENDING");
  const decided = approvals.filter((a) => a.status !== "PENDING");
  const list = tab === "history" ? decided : pending;

  return (
    <>
      <ColumnHeader
        title="Approvals"
        subtitle="High-risk actions wait for you"
      >
        <TabBar
          tabs={[
            { key: "pending", label: `Pending (${pending.length})` },
            { key: "history", label: "History" },
          ]}
          active={tab}
          basePath="/approvals"
        />
      </ColumnHeader>

      {list.length === 0 ? (
        <p className="p-8 text-center text-sm text-x-muted">
          {tab === "history" ? "No decisions yet." : "Nothing waiting on you. 🎉"}
        </p>
      ) : (
        list.map((a) => (
          <TimelineRow
            key={a.id}
            avatar={<AgentAvatar type={a.requestedByAgent?.type} size={40} />}
            name={a.requestedByAgent?.name ?? "System"}
            handle={handleFor(a.requestedByAgent?.type)}
            time={timeAgo(a.createdAt)}
            chip={
              <span className="flex gap-1.5">
                <Badge>{a.level}</Badge>
                <Badge>{tab === "history" ? a.status : a.riskLevel}</Badge>
              </span>
            }
            actions={tab === "pending" ? <ApprovalActions id={a.id} /> : undefined}
          >
            <div className="font-semibold text-x-text">{a.title}</div>
            <div className="mt-0.5 text-[13px] text-x-muted">{a.actionType}</div>
            {a.impactAnalysis && (
              <p className="mt-1 text-[15px] text-x-text">{a.impactAnalysis}</p>
            )}
          </TimelineRow>
        ))
      )}
    </>
  );
}
