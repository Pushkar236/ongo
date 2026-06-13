"use client";

import { Sparkles } from "lucide-react";
import Reveal from "./Reveal";

type Props = {
  eyebrow: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  align?: "center" | "left";
};

export default function SectionHeading({
  eyebrow,
  title,
  highlight,
  subtitle,
  align = "center",
}: Props) {
  const alignment =
    align === "center" ? "items-center text-center mx-auto" : "items-start text-left";

  return (
    <div className={`flex max-w-2xl flex-col gap-4 ${alignment}`}>
      <Reveal>
        <span className="eyebrow">
          <Sparkles className="h-3.5 w-3.5 text-brand-cyan" />
          {eyebrow}
        </span>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl text-balance">
          {title}{" "}
          {highlight && <span className="gradient-text">{highlight}</span>}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.16}>
          <p className="text-base leading-relaxed text-slate-400 sm:text-lg text-balance">
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}
