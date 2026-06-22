"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Code2, Github, Globe, Star } from "lucide-react";
import { projects } from "@/lib/data";
import type { ShowcaseProject } from "@/lib/showcase";
import SectionHeading from "./ui/SectionHeading";
import Reveal from "./ui/Reveal";

// Deterministic brand gradient per repo so cards look intentional, not random.
const GRADIENTS = [
  "from-blue-500 via-indigo-500 to-violet-600",
  "from-cyan-400 via-sky-500 to-blue-600",
  "from-violet-500 via-purple-500 to-fuchsia-600",
  "from-emerald-400 via-cyan-500 to-blue-600",
  "from-orange-500 via-rose-500 to-purple-600",
  "from-sky-400 via-blue-500 to-indigo-600",
];

function gradientFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

function titleCase(s: string): string {
  return s
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export default function Portfolio({ items }: { items?: ShowcaseProject[] }) {
  const live = items?.filter((p) => p?.name) ?? [];
  const useLive = live.length > 0;

  return (
    <section id="portfolio" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="container-page">
        <SectionHeading
          eyebrow="Our Work"
          title={useLive ? "Projects we're" : "Recent projects we're"}
          highlight="shipping"
          subtitle={
            useLive
              ? "Pulled live from our GitHub and updated automatically — real builds, not mockups."
              : "A glimpse of the websites and platforms we've crafted across industries — each built for speed, beauty, and results."
          }
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {useLive
            ? live.map((project, i) => {
                const href = project.liveUrl || project.repoUrl || undefined;
                const Icon = project.liveUrl ? Globe : Github;
                const gradient = gradientFor(project.slug || project.name);
                const category = project.tech?.[0] || "Project";
                const blurb =
                  project.tagline ||
                  project.description ||
                  "An OnGo build, live on GitHub.";
                return (
                  <Reveal key={project.id} delay={(i % 3) * 0.08}>
                    <motion.a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -8 }}
                      transition={{ type: "spring", stiffness: 280, damping: 20 }}
                      data-cursor="hover"
                      className="group relative block h-full overflow-hidden rounded-3xl glass card-glow"
                    >
                      {/* Preview window */}
                      <div className="relative aspect-[16/11] overflow-hidden">
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-transform duration-700 group-hover:scale-110`}
                        />
                        <div className="absolute inset-x-0 top-0 flex items-center gap-1.5 bg-black/20 px-4 py-3 backdrop-blur-sm">
                          <span className="h-2.5 w-2.5 rounded-full bg-white/40" />
                          <span className="h-2.5 w-2.5 rounded-full bg-white/40" />
                          <span className="h-2.5 w-2.5 rounded-full bg-white/40" />
                          <span className="ml-3 h-4 flex-1 rounded-full bg-white/20" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Icon
                            className="h-16 w-16 text-white/90 drop-shadow-lg transition-transform duration-500 group-hover:scale-110"
                            aria-hidden
                          />
                        </div>
                        {project.stars > 0 && (
                          <span className="absolute right-4 top-3 inline-flex items-center gap-1 rounded-full bg-black/30 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
                            <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
                            {project.stars}
                          </span>
                        )}
                        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
                            {project.liveUrl ? "Visit Live" : "View Code"}
                            <ArrowUpRight className="h-4 w-4" aria-hidden />
                          </span>
                        </div>
                      </div>

                      {/* Meta */}
                      <div className="p-6">
                        <span className="text-xs font-medium uppercase tracking-wider text-brand-cyan">
                          {category}
                        </span>
                        <h3 className="mt-2 font-display text-lg font-semibold text-white">
                          {titleCase(project.name)}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">
                          {blurb}
                        </p>
                        {project.tech?.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {project.tech.slice(0, 3).map((t) => (
                              <span
                                key={t}
                                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-slate-300"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.a>
                  </Reveal>
                );
              })
            : projects.map((project, i) => {
                const Icon = project.icon;
                return (
                  <Reveal key={project.title} delay={(i % 3) * 0.08}>
                    <motion.article
                      whileHover={{ y: -8 }}
                      transition={{ type: "spring", stiffness: 280, damping: 20 }}
                      data-cursor="hover"
                      className="group relative h-full overflow-hidden rounded-3xl glass card-glow"
                    >
                      {/* Preview window */}
                      <div className="relative aspect-[16/11] overflow-hidden">
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${project.gradient} transition-transform duration-700 group-hover:scale-110`}
                        />
                        {/* Faux browser chrome */}
                        <div className="absolute inset-x-0 top-0 flex items-center gap-1.5 bg-black/20 px-4 py-3 backdrop-blur-sm">
                          <span className="h-2.5 w-2.5 rounded-full bg-white/40" />
                          <span className="h-2.5 w-2.5 rounded-full bg-white/40" />
                          <span className="h-2.5 w-2.5 rounded-full bg-white/40" />
                          <span className="ml-3 h-4 flex-1 rounded-full bg-white/20" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Icon
                            className="h-16 w-16 text-white/90 drop-shadow-lg transition-transform duration-500 group-hover:scale-110"
                            aria-hidden
                          />
                        </div>
                        {/* Hover overlay */}
                        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
                            View Project <ArrowUpRight className="h-4 w-4" aria-hidden />
                          </span>
                        </div>
                      </div>

                      {/* Meta */}
                      <div className="p-6">
                        <span className="text-xs font-medium uppercase tracking-wider text-brand-cyan">
                          {project.category}
                        </span>
                        <h3 className="mt-2 font-display text-lg font-semibold text-white">
                          {project.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-400">
                          {project.description}
                        </p>
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
