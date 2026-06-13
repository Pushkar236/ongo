"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { plans } from "@/lib/data";
import { whatsappLink } from "@/lib/site";
import SectionHeading from "./ui/SectionHeading";
import Reveal from "./ui/Reveal";
import Button from "./ui/Button";

export default function Pricing() {
  return (
    <section id="pricing" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="container-page">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple, transparent"
          highlight="packages"
          subtitle="Pick a plan that fits your goals. Every package is fully customizable — talk to us for a tailored quote."
        />

        <div className="mt-16 grid items-stretch gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => {
            const popular = plan.popular;
            return (
              <Reveal key={plan.name} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -10 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className={`relative flex h-full flex-col rounded-3xl p-8 transition-shadow duration-500 ${
                    popular
                      ? "glass-strong shadow-glow lg:-mt-4 lg:mb-0"
                      : "glass card-glow"
                  }`}
                >
                  {popular && (
                    <>
                      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-brand-blue/10 to-transparent" />
                      <div
                        className="pointer-events-none absolute inset-0 rounded-3xl p-px"
                        style={{
                          background:
                            "linear-gradient(135deg, #2563EB, #06B6D4, #8B5CF6)",
                          WebkitMask:
                            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                          WebkitMaskComposite: "xor",
                          maskComposite: "exclude",
                        }}
                      />
                      <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-blue to-brand-purple px-4 py-1.5 text-xs font-semibold text-white shadow-glow">
                        <Sparkles className="h-3.5 w-3.5" aria-hidden /> Most Popular
                      </span>
                    </>
                  )}

                  <div className="relative">
                    <h3 className="font-display text-lg font-semibold text-white">
                      {plan.name}
                    </h3>
                    <p className="mt-1.5 text-sm text-slate-400">{plan.blurb}</p>
                    <div className="mt-6 flex items-end gap-1">
                      <span className="font-display text-4xl font-extrabold text-white">
                        {plan.price}
                      </span>
                      <span className="mb-1 text-sm text-slate-500">
                        one-time
                      </span>
                    </div>

                    <ul className="mt-7 space-y-3.5">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-3 text-sm text-slate-300"
                        >
                          <span
                            className={`inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                              popular
                                ? "bg-gradient-to-br from-brand-blue to-brand-purple"
                                : "bg-white/10"
                            }`}
                          >
                            <Check className="h-3 w-3 text-white" aria-hidden />
                          </span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="relative mt-8 pt-4">
                    <Button
                      href={whatsappLink(
                        `Hi OnGo, I'm interested in the ${plan.name}.`
                      )}
                      external
                      variant={popular ? "primary" : "ghost"}
                      className="w-full"
                    >
                      Choose {plan.name.split(" ")[0]}
                    </Button>
                  </div>
                </motion.div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.15}>
          <p className="mt-10 text-center text-sm text-slate-500">
            Need something custom?{" "}
            <a href="#contact" className="text-brand-cyan hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900">
              Let&apos;s build a tailored plan together →
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
