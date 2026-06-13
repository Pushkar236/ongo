"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  glow?: boolean;
};

export default function GlassCard({
  children,
  className = "",
  glow = true,
}: Props) {
  return (
    <div
      className={`glass rounded-3xl ${glow ? "card-glow" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
