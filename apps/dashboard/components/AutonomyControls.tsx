"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Power } from "lucide-react";
import { RunCycleButton } from "./x/RunCycleButton";
import { PillButton } from "./x/PillButton";

export default function AutonomyControls({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function call(action: "start" | "stop") {
    setBusy(action);
    await fetch(`/api/autonomy/${action}`, { method: "POST" });
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <RunCycleButton />
      {enabled ? (
        <PillButton variant="outline" onClick={() => call("stop")} disabled={!!busy}>
          <Power className="h-3.5 w-3.5" aria-hidden />
          Stop engine
        </PillButton>
      ) : (
        <PillButton variant="outline" onClick={() => call("start")} disabled={!!busy}>
          <Play className="h-3.5 w-3.5" aria-hidden />
          Start engine
        </PillButton>
      )}
    </div>
  );
}
