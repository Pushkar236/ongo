"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only show the brand flash on the first visit of a session, and never for
    // reduced-motion users — so it can't gate LCP on repeat views.
    const seen = sessionStorage.getItem("ongo_seen");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduce) {
      setLoading(false);
      return;
    }
    sessionStorage.setItem("ongo_seen", "1");
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-ink-900"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <div className="flex flex-col items-center gap-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="absolute inset-0 -z-10 animate-pulse rounded-2xl bg-brand-blue/40 blur-2xl" />
              <span className="font-display text-4xl font-extrabold tracking-tight text-white">
                On<span className="gradient-text">Go</span>
              </span>
            </motion.div>
            <div className="h-1 w-40 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-brand-blue via-brand-cyan to-brand-purple"
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
              />
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Loading experience
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
