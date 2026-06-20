import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass rounded-2xl p-5 ${className}`}>{children}</div>
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
  accent?: "blue" | "cyan" | "purple" | "amber";
}) {
  const ring = {
    blue: "from-brand-blue/20",
    cyan: "from-brand-cyan/20",
    purple: "from-brand-purple/20",
    amber: "from-amber-500/20",
  }[accent];
  return (
    <div className="glass relative overflow-hidden rounded-2xl p-5">
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${ring} to-transparent blur-xl`}
      />
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-2 text-3xl font-bold text-white">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

const TONE: Record<string, string> = {
  HIGH: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
  MEDIUM: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  LOW: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  MANDATORY: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
  SUGGESTED: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  AUTO: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  PENDING: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  APPROVED: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  REJECTED: "bg-slate-500/15 text-slate-300 ring-slate-500/30",
  AUTO_APPROVED: "bg-cyan-500/15 text-cyan-300 ring-cyan-500/30",
  ACTIVE: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  LIVE: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
};

export function Badge({ children }: { children: string }) {
  const tone = TONE[children] ?? "bg-white/10 text-slate-300 ring-white/20";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ${tone}`}
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
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
    </div>
  );
}
