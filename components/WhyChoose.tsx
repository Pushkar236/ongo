"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { stats } from "@/lib/data";
import SectionHeading from "./ui/SectionHeading";
import Reveal from "./ui/Reveal";
import AnimatedCounter from "./ui/AnimatedCounter";
import FloatingBlobs from "./ui/FloatingBlobs";

const reasons = [
  "Senior designers & developers on every project",
  "Conversion-focused, data-informed design",
  "Transparent pricing — no hidden costs",
  "Lifetime support & lightning-fast revisions",
];

export default function WhyChoose() {
  return (
    <section id="why" className="relative scroll-mt-24 overflow-hidden py-24 sm:py-32">
      <FloatingBlobs className="opacity-60" />
      <div className="container-page relative">
        <SectionHeading
          eyebrow="Why Choose OnGo"
          title="Results you can"
          highlight="measure"
          subtitle="We don't just build websites — we build growth engines that businesses rely on every single day."
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Reveal key={stat.label} delay={i * 0.1}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="card-glow glass relative h-full rounded-3xl p-8 text-center"
                >
                  <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-blue/20 to-brand-purple/20 ring-1 ring-white/10">
                    <Icon className="h-6 w-6 text-brand-cyan" />
                  </div>
                  <div className="font-display text-4xl font-extrabold text-white sm:text-5xl">
                    {stat.isText ? (
                      <span className="gradient-text">{stat.text}</span>
                    ) : (
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    )}
                  </div>
                  <div className="mt-2 text-sm font-medium uppercase tracking-wider text-slate-400">
                    {stat.label}
                  </div>
                </motion.div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.1}>
          <div className="card-glow glass mx-auto mt-10 max-w-3xl rounded-3xl p-8 sm:p-10">
            <div className="grid gap-4 sm:grid-cols-2">
              {reasons.map((reason) => (
                <div key={reason} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-cyan" />
                  <span className="text-sm text-slate-300">{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
