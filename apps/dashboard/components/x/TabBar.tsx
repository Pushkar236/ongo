import Link from "next/link";

/**
 * X-style tab bar with the underline indicator. Tabs are query-param driven
 * (e.g. ?tab=pending) so pages stay server components and read the active tab
 * from searchParams. Set `href` on a tab to navigate to a route instead.
 */
export function TabBar({
  tabs,
  active,
  basePath,
  paramName = "tab",
}: {
  tabs: Array<{ key: string; label: string; href?: string }>;
  active: string;
  basePath: string;
  paramName?: string;
}) {
  return (
    <div className="flex border-b border-x-border">
      {tabs.map((t) => {
        const isActive = t.key === active;
        const href = t.href ?? `${basePath}?${paramName}=${t.key}`;
        return (
          <Link
            key={t.key}
            href={href}
            className="relative flex-1 px-3 py-4 text-center text-[15px] font-semibold transition hover:bg-x-hover"
          >
            <span className={isActive ? "text-x-text" : "text-x-muted"}>
              {t.label}
            </span>
            {isActive && (
              <span className="absolute inset-x-0 bottom-0 mx-auto h-1 w-14 rounded-full bg-x-blue" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
