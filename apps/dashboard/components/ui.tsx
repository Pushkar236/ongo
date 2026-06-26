import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-x-border bg-x-surface p-4 ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  accent = "blue",
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "blue" | "cyan" | "purple" | "amber" | "green";
}) {
  const bar = {
    blue: "#1d9bf0",
    cyan: "#00b8d4",
    purple: "#7856ff",
    amber: "#f7b928",
    green: "#00ba7c",
  }[accent];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-x-border bg-x-surface p-4">
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: bar }}
        aria-hidden
      />
      <div className="text-sm text-x-muted">{label}</div>
      <div className="mt-1 text-2xl font-bold text-x-text">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-x-muted">{hint}</div>}
    </div>
  );
}

const TONE: Record<string, string> = {
  HIGH: "bg-x-red/15 text-x-red",
  MEDIUM: "bg-x-amber/15 text-x-amber",
  LOW: "bg-x-green/15 text-x-green",
  MANDATORY: "bg-x-red/15 text-x-red",
  SUGGESTED: "bg-x-amber/15 text-x-amber",
  AUTO: "bg-x-green/15 text-x-green",
  PENDING: "bg-x-amber/15 text-x-amber",
  APPROVED: "bg-x-green/15 text-x-green",
  REJECTED: "bg-white/10 text-x-muted",
  AUTO_APPROVED: "bg-x-blue/15 text-x-blue",
  ACTIVE: "bg-x-green/15 text-x-green",
  LIVE: "bg-x-green/15 text-x-green",
  WORKING: "bg-x-blue/15 text-x-blue",
};

export function Badge({ children }: { children: string }) {
  const tone = TONE[children] ?? "bg-white/10 text-x-muted";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${tone}`}
    >
      {children.replace(/_/g, " ")}
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4">
      <h1 className="text-xl font-bold tracking-tight text-x-text">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-x-muted">{subtitle}</p>}
    </div>
  );
}
