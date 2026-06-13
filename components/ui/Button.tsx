"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Variant = "primary" | "ghost" | "whatsapp";

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  className?: string;
  type?: "button" | "submit";
  external?: boolean;
};

const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900";

const variants: Record<Variant, string> = {
  primary:
    "text-white shadow-glow bg-gradient-to-r from-brand-blue via-brand-cyan to-brand-purple bg-[length:200%_auto] hover:bg-[position:100%_center]",
  ghost:
    "text-slate-100 glass hover:bg-white/[0.08] hover:border-white/20",
  whatsapp:
    "text-white bg-[#25D366] hover:bg-[#1ebe5a] shadow-[0_0_40px_-12px_rgba(37,211,102,0.7)]",
};

export default function Button({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
  external,
}: Props) {
  const classes = `${base} ${variants[variant]} ${className}`;
  const content = (
    <motion.span
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className="inline-flex items-center gap-2"
    >
      {children}
    </motion.span>
  );

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {content}
    </button>
  );
}
