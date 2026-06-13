"use client";

import { motion } from "framer-motion";
import { aboutFeatures } from "@/lib/data";
import SectionHeading from "./ui/SectionHeading";
import Reveal from "./ui/Reveal";

export default function About() {
  return (
    <section id="about" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="container-page">
        <SectionHeading
          eyebrow="About OnGo"
          title="Helping businesses build a"
          highlight="powerful online presence"
          subtitle="We craft high-performance websites and digital solutions that turn visitors into loyal customers — combining strategy, design, and engineering under one roof."
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {aboutFeatures.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="card-glow glass group h-full rounded-3xl p-7"
                >
                  <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-blue/20 to-brand-purple/20 ring-1 ring-white/10 transition-all group-hover:ring-brand-cyan/40">
                    <Icon className="h-6 w-6 text-brand-cyan" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {feature.description}
                  </p>
                </motion.div>
              </Reveal>
            );
          })}
        </div>

        {/* Mission strip */}
        <Reveal delay={0.1}>
          <div className="card-glow glass mt-10 overflow-hidden rounded-3xl p-8 sm:p-10">
            <div className="grid items-center gap-8 lg:grid-cols-[1.5fr_1fr]">
              <p className="font-display text-xl font-medium leading-relaxed text-slate-200 sm:text-2xl text-balance">
                Our mission is simple — give every business the kind of website
                that{" "}
                <span className="gradient-text">looks premium, loads fast,</span>{" "}
                and actually drives growth.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { k: "Avg. load", v: "< 1.5s" },
                  { k: "Lighthouse", v: "90+" },
                  { k: "Delivery", v: "Days" },
                  { k: "Support", v: "24/7" },
                ].map((s) => (
                  <div
                    key={s.k}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center"
                  >
                    <div className="font-display text-2xl font-bold text-white">
                      {s.v}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-wider text-slate-500">
                      {s.k}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
