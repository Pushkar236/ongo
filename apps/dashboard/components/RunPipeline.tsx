"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";

export default function RunPipeline({ pipeline }: { pipeline: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  async function run() {
    setBusy(true);
    setNote("");
    const res = await fetch("/api/workflows/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pipeline }),
    });
    if (res.ok) {
      const data = await res.json();
      setNote(
        data.pausedForApproval
          ? "Ran — paused at an approval gate."
          : "Ran — completed.",
      );
    } else {
      setNote("Run failed.");
    }
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={run}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-cyan to-brand-blue px-3 py-1.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        <Play className="h-3.5 w-3.5" aria-hidden />
        {busy ? "Running…" : "Run"}
      </button>
      {note && <span className="text-xs text-slate-400">{note}</span>}
    </div>
  );
}
