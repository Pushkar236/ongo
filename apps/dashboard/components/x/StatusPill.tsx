/** Agent status pill — WORKING pulses blue so you can see live activity. */
const STATUS: Record<string, { label: string; color: string; pulse?: boolean }> = {
  WORKING: { label: "Working", color: "#1d9bf0", pulse: true },
  IDLE: { label: "Idle", color: "#71767b" },
  PAUSED: { label: "Paused", color: "#ffd400" },
  OFFLINE: { label: "Offline", color: "#71767b" },
};

export function StatusPill({ status }: { status?: string | null }) {
  const s = (status && STATUS[status]) || {
    label: status ?? "Unknown",
    color: "#71767b",
  };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ backgroundColor: `${s.color}1f`, color: s.color }}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${s.pulse ? "x-pulse" : ""}`}
        style={{ backgroundColor: s.color }}
      />
      {s.label}
    </span>
  );
}
