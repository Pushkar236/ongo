"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { services } from "@/lib/data";
import SectionHeading from "./ui/SectionHeading";
import Reveal from "./ui/Reveal";

const accentMap = {
  blue: {
    glow: "group-hover:shadow-glow",
    text: "text-brand-blue",
    ring: "group-hover:ring-brand-blue/40",
    bg: "from-brand-blue/20",
  },
  cyan: {
    glow: "group-hover:shadow-glow-cyan",
    text: "text-brand-cyan",
    ring: "group-hover:ring-brand-cyan/40",
    bg: "from-brand-cyan/20",
  },
  purple: {
    glow: "group-hover:shadow-glow-purple",
    text: "text-brand-purple",
    ring: "group-hover:ring-brand-purple/40",
    bg: "from-brand-purple/20",
  },
} as const;

export default function Services() {
  return (
    <section id="services" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="container-page">
        <SectionHeading
          eyebrow="What We Do"
          title="Premium services,"
          highlight="built to perform"
          subtitle="From a first website to a full custom platform — everything you need to launch, grow, and scale online."
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => {
            const Icon = service.icon;
            const accent = accentMap[service.accent];
            return (
              <Reveal key={service.title} delay={(i % 3) * 0.08}>
                <motion.article
                  whileHover={{ y: -10 }}
                  transition={{ type: "spring", stiffness: 280, damping: 20 }}
                  className={`card-glow glass group relative h-full overflow-hidden rounded-3xl p-8 transition-shadow duration-500 ${accent.glow}`}
                >
                  <div
                    className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${accent.bg} to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`}
                  />
                  <div
                    className={`relative mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${accent.bg} to-transparent ring-1 ring-white/10 transition-all ${accent.ring}`}
                  >
                    <Icon className={`h-6 w-6 ${accent.text}`} aria-hidden />
                  </div>
                  <h3 className="relative font-display text-xl font-semibold text-white">
                    {service.title}
                  </h3>
                  <p className="relative mt-3 text-sm leading-relaxed text-slate-400">
                    {service.description}
                  </p>
                  <div className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-300 transition-colors group-hover:text-white">
                    Learn more
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                  </div>
                </motion.article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
