"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { projects } from "@/lib/data";
import SectionHeading from "./ui/SectionHeading";
import Reveal from "./ui/Reveal";

export default function Portfolio() {
  return (
    <section id="portfolio" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="container-page">
        <SectionHeading
          eyebrow="Our Work"
          title="Recent projects we're"
          highlight="proud of"
          subtitle="A glimpse of the websites and platforms we've crafted across industries — each built for speed, beauty, and results."
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => {
            const Icon = project.icon;
            return (
              <Reveal key={project.title} delay={(i % 3) * 0.08}>
                <motion.article
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 280, damping: 20 }}
                  data-cursor="hover"
                  className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
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
                      <Icon className="h-16 w-16 text-white/90 drop-shadow-lg transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
                        View Project <ArrowUpRight className="h-4 w-4" />
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
