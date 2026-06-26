"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { PillButton } from "./PillButton";

/**
 * The X "Post"-equivalent primary action: trigger one autonomy cycle. Shared
 * by the left rail, the mobile FAB, and the Autonomy page. After dispatch it
 * refreshes so the agents visibly light up in the feed + live view.
 */
export function RunCycleButton({
  compact = false,
  full = false,
}: {
  compact?: boolean; // icon-only (collapsed rail / FAB)
  full?: boolean; // full-width (expanded rail)
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    await fetch("/api/autonomy/tick", { method: "POST" });
    setBusy(false);
    router.refresh();
  }

  if (compact) {
    return (
      <button
        onClick={run}
        disabled={busy}
        aria-label="Run cycle"
        className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-x-blue text-white shadow-lg transition hover:bg-x-blue-hover disabled:opacity-50"
      >
        <Zap className={`h-5 w-5 ${busy ? "x-pulse" : ""}`} />
      </button>
    );
  }

  return (
    <PillButton onClick={run} disabled={busy} className={full ? "w-full py-3 text-base" : ""}>
      <Zap className={`h-4 w-4 ${busy ? "x-pulse" : ""}`} />
      {busy ? "Running…" : "Run Cycle"}
    </PillButton>
  );
}
