"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Power, Zap } from "lucide-react";

export default function AutonomyControls({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState("");

  async function call(action: "tick" | "start" | "stop") {
    setBusy(action);
    setNote("");
    const res = await fetch(`/api/autonomy/${action}`, { method: "POST" });
    setNote(res.ok ? `${action} ok` : `${action} failed`);
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={() => call("tick")}
        disabled={!!busy}
        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-cyan to-brand-blue px-3 py-1.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        <Zap className="h-3.5 w-3.5" aria-hidden />
        {busy === "tick" ? "Running…" : "Run one cycle"}
      </button>
      {enabled ? (
        <button
          onClick={() => call("stop")}
          disabled={!!busy}
          className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-1.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5 disabled:opacity-60"
        >
          <Power className="h-3.5 w-3.5" aria-hidden />
          Stop engine
        </button>
      ) : (
        <button
          onClick={() => call("start")}
          disabled={!!busy}
          className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 px-3 py-1.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/10 disabled:opacity-60"
        >
          <Play className="h-3.5 w-3.5" aria-hidden />
          Start engine
        </button>
      )}
      {note && <span className="text-xs text-slate-400">{note}</span>}
    </div>
  );
}
