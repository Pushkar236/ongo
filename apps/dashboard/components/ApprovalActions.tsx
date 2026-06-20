"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApprovalActions({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);

  async function act(action: "approve" | "reject") {
    setBusy(action);
    await fetch(`/api/approvals/${id}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: "" }),
    });
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => act("approve")}
        disabled={busy !== null}
        className="rounded-lg bg-emerald-500/90 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
      >
        {busy === "approve" ? "Approving…" : "Approve"}
      </button>
      <button
        onClick={() => act("reject")}
        disabled={busy !== null}
        className="rounded-lg border border-white/15 px-3 py-1.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
      >
        {busy === "reject" ? "Rejecting…" : "Reject"}
      </button>
    </div>
  );
}
