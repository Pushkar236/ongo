"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShieldCheck, Activity, Bot, Cpu } from "lucide-react";
import { RunCycleButton } from "./RunCycleButton";

const TABS = [
  { href: "/", icon: Home },
  { href: "/agents", icon: Bot },
  { href: "/autonomy", icon: Cpu },
  { href: "/approvals", icon: ShieldCheck },
  { href: "/activity", icon: Activity },
];

export function MobileTabBar() {
  const pathname = usePathname();
  return (
    <>
      <div className="fixed bottom-5 right-5 z-40 md:hidden">
        <RunCycleButton compact />
      </div>
      <nav className="x-blur-header fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-x-border md:hidden">
        {TABS.map(({ href, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 items-center justify-center py-3"
            >
              <Icon
                className={`h-6 w-6 ${active ? "text-x-blue" : "text-x-muted"}`}
                strokeWidth={active ? 2.5 : 2}
              />
            </Link>
          );
        })}
      </nav>
    </>
  );
}
