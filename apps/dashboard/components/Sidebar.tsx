"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShieldCheck,
  Activity,
  FolderKanban,
  Lightbulb,
  Bot,
  Workflow,
  Inbox,
  Cpu,
  LogOut,
} from "lucide-react";
import type { SessionUser } from "@/lib/types";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/autonomy", label: "Autonomy Engine", icon: Cpu },
  { href: "/approvals", label: "Approval Center", icon: ShieldCheck },
  { href: "/workflows", label: "Workflows", icon: Workflow },
  { href: "/activity", label: "Agent Activity", icon: Activity },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/opportunities", label: "Opportunities", icon: Lightbulb },
  { href: "/leads", label: "Marketplace Leads", icon: Inbox },
  { href: "/agents", label: "Agents", icon: Bot },
];

export default function Sidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex w-64 flex-shrink-0 flex-col border-r border-white/10 bg-white/[0.02] p-4">
      <div className="px-2 py-3 text-xl font-bold tracking-tight">
        On<span className="gradient-text">Go</span>
        <span className="ml-2 align-middle text-[10px] font-medium uppercase tracking-widest text-slate-500">
          Brain
        </span>
      </div>

      <nav className="mt-4 flex-1 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                active
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/10 pt-3">
        <div className="px-3 py-2">
          <div className="truncate text-sm font-medium text-white">
            {user.name}
          </div>
          <div className="truncate text-xs text-slate-500">{user.email}</div>
          <div className="mt-1 inline-block rounded-full bg-brand-blue/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-cyan">
            {user.role}
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Sign out
        </button>
      </div>
    </aside>
  );
}
