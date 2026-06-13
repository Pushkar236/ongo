"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { testimonials } from "@/lib/data";
import SectionHeading from "./ui/SectionHeading";
import Reveal from "./ui/Reveal";

const accentMap = {
  blue: "from-brand-blue to-brand-cyan",
  cyan: "from-brand-cyan to-brand-blue",
  purple: "from-brand-purple to-brand-blue",
} as const;

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative scroll-mt-24 py-24 sm:py-32"
    >
      <div className="container-page">
        <SectionHeading
          eyebrow="Testimonials"
          title="Loved by the businesses"
          highlight="we've launched"
          subtitle="Don't just take our word for it — here's what our clients say about working with OnGo."
        />

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <motion.figure
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 280, damping: 20 }}
                className="card-glow glass relative flex h-full flex-col rounded-3xl p-8"
              >
                <Quote className="absolute right-7 top-7 h-10 w-10 text-white/[0.06]" aria-hidden />
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <Star
                      key={s}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                      aria-hidden
                    />
                  ))}
                </div>
                <blockquote className="mt-5 flex-1 text-[15px] leading-relaxed text-slate-200">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-7 flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${accentMap[t.accent]} font-display text-sm font-bold text-white`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{t.name}</div>
                    <div className="text-sm text-slate-400">{t.role}</div>
                  </div>
                </figcaption>
              </motion.figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
