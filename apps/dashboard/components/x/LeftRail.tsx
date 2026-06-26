"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  ShieldCheck,
  Activity,
  FolderKanban,
  Lightbulb,
  Bot,
  Workflow,
  Inbox,
  Cpu,
  LogOut,
  Hexagon,
} from "lucide-react";
import type { SessionUser } from "@/lib/types";
import { Avatar } from "./Avatar";
import { RunCycleButton } from "./RunCycleButton";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/autonomy", label: "Autonomy", icon: Cpu },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/approvals", label: "Approvals", icon: ShieldCheck },
  { href: "/workflows", label: "Workflows", icon: Workflow },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/opportunities", label: "Opportunities", icon: Lightbulb },
  { href: "/leads", label: "Leads", icon: Inbox },
];

export function LeftRail({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="sticky top-0 hidden h-screen flex-col px-2 py-2 md:flex md:w-[88px] xl:w-[275px] xl:px-3">
      {/* Logo */}
      <Link
        href="/"
        className="mb-1 flex items-center gap-2 rounded-full px-3 py-3 hover:bg-x-hover"
      >
        <Hexagon className="h-7 w-7 text-x-blue" fill="currentColor" />
        <span className="hidden text-xl font-extrabold tracking-tight text-x-text xl:inline">
          OnGo
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-4 rounded-full px-3 py-3 text-xl transition hover:bg-x-hover xl:pr-6"
            >
              <Icon
                className={`h-6 w-6 shrink-0 ${active ? "text-x-text" : "text-x-text"}`}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className={`hidden xl:inline ${active ? "font-bold text-x-text" : "text-x-text"}`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Primary action */}
      <div className="my-3 hidden xl:block">
        <RunCycleButton full />
      </div>
      <div className="my-3 flex justify-center xl:hidden">
        <RunCycleButton compact />
      </div>

      {/* User chip */}
      <div className="mt-auto flex items-center gap-3 rounded-full p-2 hover:bg-x-hover">
        <Avatar size={36}>{(user.name || user.email)[0]?.toUpperCase()}</Avatar>
        <div className="hidden min-w-0 flex-1 xl:block">
          <div className="truncate text-sm font-bold text-x-text">
            {user.name}
          </div>
          <div className="truncate text-xs text-x-muted">{user.email}</div>
        </div>
        <button
          onClick={logout}
          aria-label="Sign out"
          className="hidden rounded-full p-2 text-x-muted transition hover:bg-x-bg hover:text-x-text xl:inline-flex"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
