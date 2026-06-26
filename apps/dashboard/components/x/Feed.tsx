import type { ReactNode } from "react";
import Link from "next/link";

/**
 * A post-style row for the X "timeline" metaphor: avatar on the left, then a
 * header line (name · @handle · time) with an optional chip, then the body.
 * Used by the activity feed, approvals, opportunities, leads, agent profiles.
 */
export function TimelineRow({
  avatar,
  name,
  handle,
  time,
  chip,
  actions,
  children,
  href,
}: {
  avatar: ReactNode;
  name: ReactNode;
  handle?: string;
  time?: string;
  chip?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  href?: string;
}) {
  const inner = (
    <div className="flex gap-3 px-4 py-3">
      <div className="pt-0.5">{avatar}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[15px]">
          <span className="truncate font-bold text-x-text">{name}</span>
          {handle && <span className="truncate text-x-muted">{handle}</span>}
          {time && (
            <span className="text-x-muted">
              <span className="px-0.5">·</span>
              {time}
            </span>
          )}
          {chip && <span className="ml-auto pl-2">{chip}</span>}
        </div>
        {children && (
          <div className="mt-0.5 text-[15px] leading-snug text-x-text">
            {children}
          </div>
        )}
        {actions && <div className="mt-2 flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block x-divider x-row-hover">
        {inner}
      </Link>
    );
  }
  return <div className="x-divider x-row-hover">{inner}</div>;
}
