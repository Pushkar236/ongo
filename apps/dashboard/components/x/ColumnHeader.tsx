import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * The sticky, blurred header at the top of each center-column page (like X).
 * Optional back arrow + a right-aligned action slot. Tabs/extra content render
 * as children directly under the title (e.g. a <TabBar/>).
 */
export function ColumnHeader({
  title,
  subtitle,
  backHref,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  action?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="x-blur-header">
      <div className="flex items-center gap-4 px-4 py-3">
        {backHref && (
          <Link
            href={backHref}
            className="rounded-full p-1.5 text-x-text transition hover:bg-x-hover"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold leading-tight text-x-text">
            {title}
          </h1>
          {subtitle && (
            <p className="truncate text-[13px] text-x-muted">{subtitle}</p>
          )}
        </div>
        {action && <div className="ml-auto">{action}</div>}
      </div>
      {children}
    </header>
  );
}
