"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <button
      onClick={convert}
      disabled={busy}
      className="rounded-lg border border-white/15 px-3 py-1.5 text-sm font-semibold text-brand-cyan transition hover:bg-white/5 disabled:opacity-50"
    >
      {busy ? "Converting…" : "Convert → Opportunity"}
    </button>
  );
}
