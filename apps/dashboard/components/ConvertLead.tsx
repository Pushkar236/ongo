"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PillButton } from "./x/PillButton";

export default function ConvertLead({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function convert() {
    setBusy(true);
    await fetch(`/api/leads/${id}/convert`, { method: "POST" });
    setBusy(false);
    router.refresh();
  }

  return (
    <PillButton variant="outline" onClick={convert} disabled={busy}>
      {busy ? "Converting…" : "Convert → Opportunity"}
    </PillButton>
  );
}
