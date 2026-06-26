"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PillButton } from "./x/PillButton";

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
      <PillButton onClick={() => act("approve")} disabled={busy !== null}>
        {busy === "approve" ? "Approving…" : "Approve"}
      </PillButton>
      <PillButton
        variant="outline"
        onClick={() => act("reject")}
        disabled={busy !== null}
      >
        {busy === "reject" ? "Rejecting…" : "Reject"}
      </PillButton>
    </div>
  );
}
