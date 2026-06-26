import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "outline" | "danger" | "ghost";

const VARIANT: Record<Variant, string> = {
  primary: "bg-x-blue text-white hover:bg-x-blue-hover",
  outline: "border border-x-border text-x-text hover:bg-x-hover",
  danger: "bg-x-red text-white hover:opacity-90",
  ghost: "text-x-text hover:bg-x-hover",
};

/** X-style rounded-full button. */
export function PillButton({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/** Circular icon button (rail + header affordances). */
export function IconButton({
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full p-2 text-x-text transition hover:bg-x-hover ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
