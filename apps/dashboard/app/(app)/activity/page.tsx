import { apiFetch } from "@/lib/api";
import { Badge, Card, PageHeader } from "@/components/ui";
import { timeAgo } from "@/lib/format";
import type { ActivityItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const activity = await apiFetch<ActivityItem[]>("/activity?limit=60");

  return (
    <>
      <PageHeader
        title="Agent Activity"
        subtitle="Every action the platform takes is recorded here — an immutable audit trail."
      />
      <Card>
        <ul className="divide-y divide-white/5">
          {activity.map((item) => (
            <li key={item.id} className="flex items-center gap-4 py-3">
              <Badge>{item.actorType}</Badge>
              <div className="min-w-0 flex-1">
                <span className="text-sm text-white">
                  {item.actorName ?? "system"}
                </span>{" "}
                <span className="text-sm text-slate-400">{item.action}</span>
                {item.entity && (
                  <span className="text-xs text-slate-600"> · {item.entity}</span>
                )}
              </div>
              <span className="flex-shrink-0 text-xs text-slate-600">
                {timeAgo(item.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
