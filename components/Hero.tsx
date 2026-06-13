"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Star, Zap } from "lucide-react";
import Button from "./ui/Button";
import FloatingBlobs from "./ui/FloatingBlobs";
import { site } from "@/lib/site";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};
const item = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// Floating decorative chips around the hero.
const chips = [
  { label: "E-Commerce", className: "left-[6%] top-[28%]", delay: 0 },
  { label: "SEO Ready", className: "right-[8%] top-[22%]", delay: 0.6 },
  { label: "Web Apps", className: "left-[12%] bottom-[18%]", delay: 1.2 },
  { label: "UI/UX", className: "right-[10%] bottom-[24%]", delay: 1.8 },
];

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden pt-28 pb-16"
    >
      <FloatingBlobs />
      <div className="absolute inset-0 -z-10 bg-grid" aria-hidden />

      {/* Floating chips — hidden on small screens to avoid clutter */}
      {chips.map((chip) => (
        <motion.div
          key={chip.label}
          className={`absolute hidden md:block ${chip.className}`}
          animate={{ y: [0, -16, 0] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: chip.delay,
          }}
        >
          <span className="glass rounded-full px-4 py-2 text-xs font-medium text-slate-200 shadow-lg">
            {chip.label}
          </span>
        </motion.div>
      ))}

      <div className="container-page relative">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mx-auto flex max-w-4xl flex-col items-center text-center"
        >
          <motion.div variants={item}>
            <span className="eyebrow">
              <Zap className="h-3.5 w-3.5 text-brand-cyan" />
              {site.tagline}
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl text-balance"
          >
            We Build Websites That{" "}
            <span className="gradient-text-shimmer">Grow Your Business</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg text-balance"
          >
            Custom websites, e-commerce stores, and web applications designed to
            attract customers and increase revenue.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-9 flex flex-col items-center gap-4 sm:flex-row"
          >
            <Button href="#contact" variant="primary">
              Get Free Consultation
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button href="#portfolio" variant="ghost">
              <Play className="h-4 w-4 text-brand-cyan" />
              View Portfolio
            </Button>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-400"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {["from-brand-blue", "from-brand-cyan", "from-brand-purple"].map(
                  (c, i) => (
                    <span
                      key={i}
                      className={`h-7 w-7 rounded-full border-2 border-ink-900 bg-gradient-to-br ${c} to-ink-700`}
                    />
                  )
                )}
              </div>
              <span>50+ businesses online</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <span>100% client satisfaction</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Fade into next section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink-900 to-transparent" />
    </section>
  );
}
