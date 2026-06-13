"use client";

import Link from "next/link";
import { Linkedin, Github, ArrowUp } from "lucide-react";
import { navLinks, services } from "@/lib/data";
import { site } from "@/lib/site";

const socials = [
  { icon: Linkedin, href: site.socials.linkedin, label: "LinkedIn" },
  { icon: Github, href: site.socials.github, label: "GitHub" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 pt-16">
      <div className="container-page">
        <div className="grid gap-12 pb-12 lg:grid-cols-[1.6fr_1fr_1fr]">
          {/* Brand */}
          <div className="max-w-sm">
            <Link
              href="#home"
              className="font-display text-2xl font-extrabold tracking-tight text-white"
            >
              On<span className="gradient-text">Go</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              {site.tagline} We build high-performance websites, e-commerce
              stores, and web apps that grow your business.
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="glass flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 transition-all hover:-translate-y-1 hover:text-brand-cyan hover:shadow-glow-cyan focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
                  >
                    <Icon className="h-[18px] w-[18px]" aria-hidden />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h4>
            <ul className="mt-5 space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-brand-cyan focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
              Services
            </h4>
            <ul className="mt-5 space-y-3">
              {services.map((service) => (
                <li key={service.title}>
                  <Link
                    href="#services"
                    className="text-sm text-slate-400 transition-colors hover:text-brand-cyan focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-7 sm:flex-row">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <a
            href="#home"
            className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-slate-300 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
          >
            Back to top <ArrowUp className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
      </div>
    </footer>
  );
}
