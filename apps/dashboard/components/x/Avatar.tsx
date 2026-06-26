import type { ReactNode } from "react";
import { agentMeta } from "@/lib/agentMeta";

/** Generic circular avatar. */
export function Avatar({
  size = 40,
  color = "#1d9bf0",
  children,
  className = "",
}: {
  size?: number;
  color?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white ${className}`}
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.4 }}
    >
      {children}
    </span>
  );
}

/** Agent identity avatar — per-type color + icon. The core visual primitive. */
export function AgentAvatar({
  type,
  size = 40,
}: {
  type?: string | null;
  size?: number;
}) {
  const { color, Icon } = agentMeta(type);
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: `${color}26`, // ~15% alpha
        boxShadow: `inset 0 0 0 1px ${color}66`,
      }}
    >
      <Icon style={{ width: size * 0.5, height: size * 0.5, color }} aria-hidden />
    </span>
  );
}
