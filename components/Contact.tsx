"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  User,
  MessageSquare,
  Send,
  MessageCircle,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { site, whatsappLink } from "@/lib/site";
import SectionHeading from "./ui/SectionHeading";
import Reveal from "./ui/Reveal";
import Button from "./ui/Button";
import FloatingBlobs from "./ui/FloatingBlobs";

type Fields = { name: string; email: string; phone: string; message: string };

const empty: Fields = { name: "", email: "", phone: "", message: "" };

export default function Contact() {
  const [fields, setFields] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Partial<Fields>>({});
  const [sent, setSent] = useState(false);

  const update = (key: keyof Fields, value: string) => {
    setFields((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const next: Partial<Fields> = {};
    if (!fields.name.trim()) next.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
      next.email = "Enter a valid email address.";
    if (!/^[\d+\s()-]{7,}$/.test(fields.phone))
      next.phone = "Enter a valid phone number.";
    if (fields.message.trim().length < 10)
      next.message = "Tell us a little more (10+ characters).";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // No backend in this build — open a pre-filled WhatsApp chat as the channel.
    const msg = `Hi OnGo! I'm ${fields.name}.\nEmail: ${fields.email}\nPhone: ${fields.phone}\n\n${fields.message}`;
    window.open(whatsappLink(msg), "_blank", "noopener,noreferrer");
    setSent(true);
    setFields(empty);
    setTimeout(() => setSent(false), 6000);
  };

  const inputBase =
    "w-full rounded-2xl border bg-white/[0.03] px-11 py-3.5 text-sm text-white placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-cyan/50";

  return (
    <section id="contact" className="relative scroll-mt-24 overflow-hidden py-24 sm:py-32">
      <FloatingBlobs className="opacity-50" />
      <div className="container-page relative">
        <SectionHeading
          eyebrow="Get In Touch"
          title="Let's build something"
          highlight="remarkable"
          subtitle="Tell us about your project and get a free, no-obligation consultation within 24 hours."
        />

        <div className="mt-16 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          {/* Left: contact info */}
          <Reveal>
            <div className="flex h-full flex-col gap-6">
              <div className="card-glow glass rounded-3xl p-8">
                <h3 className="font-display text-xl font-semibold text-white">
                  Talk to a human, fast.
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Prefer chatting? Message us on WhatsApp and we&apos;ll reply
                  right away.
                </p>
                <div className="mt-6 space-y-4">
                  {[
                    { icon: Mail, label: site.email, href: `mailto:${site.email}` },
                    {
                      icon: Phone,
                      label: site.phoneDisplay,
                      href: `tel:${site.phoneDisplay.replace(/\s/g, "")}`,
                    },
                    { icon: MapPin, label: "Remote — Worldwide", href: undefined },
                  ].map((item) => {
                    const Icon = item.icon;
                    const inner = (
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-blue/20 to-brand-purple/20 ring-1 ring-white/10">
                          <Icon className="h-5 w-5 text-brand-cyan" />
                        </span>
                        <span className="text-sm text-slate-200">
                          {item.label}
                        </span>
                      </div>
                    );
                    return item.href ? (
                      <a
                        key={item.label}
                        href={item.href}
                        className="block transition-opacity hover:opacity-80"
                      >
                        {inner}
                      </a>
                    ) : (
                      <div key={item.label}>{inner}</div>
                    );
                  })}
                </div>
                <div className="mt-7">
                  <Button
                    href={whatsappLink(
                      "Hi OnGo, I'd like a free consultation."
                    )}
                    external
                    variant="whatsapp"
                    className="w-full"
                  >
                    <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right: form */}
          <Reveal delay={0.1}>
            <form
              onSubmit={onSubmit}
              noValidate
              className="card-glow glass rounded-3xl p-8 sm:p-10"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  icon={<User className="h-4 w-4" />}
                  error={errors.name}
                >
                  <input
                    type="text"
                    placeholder="Your name"
                    value={fields.name}
                    onChange={(e) => update("name", e.target.value)}
                    className={`${inputBase} ${
                      errors.name ? "border-red-500/60" : "border-white/10"
                    }`}
                  />
                </Field>
                <Field
                  icon={<Phone className="h-4 w-4" />}
                  error={errors.phone}
                >
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={fields.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className={`${inputBase} ${
                      errors.phone ? "border-red-500/60" : "border-white/10"
                    }`}
                  />
                </Field>
              </div>

              <div className="mt-5">
                <Field icon={<Mail className="h-4 w-4" />} error={errors.email}>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={fields.email}
                    onChange={(e) => update("email", e.target.value)}
                    className={`${inputBase} ${
                      errors.email ? "border-red-500/60" : "border-white/10"
                    }`}
                  />
                </Field>
              </div>

              <div className="mt-5">
                <Field
                  icon={<MessageSquare className="h-4 w-4" />}
                  error={errors.message}
                  alignTop
                >
                  <textarea
                    rows={5}
                    placeholder="Tell us about your project…"
                    value={fields.message}
                    onChange={(e) => update("message", e.target.value)}
                    className={`${inputBase} resize-none ${
                      errors.message ? "border-red-500/60" : "border-white/10"
                    }`}
                  />
                </Field>
              </div>

              <div className="mt-7 flex flex-col items-center gap-4 sm:flex-row">
                <Button type="submit" variant="primary" className="w-full sm:w-auto">
                  <Send className="h-4 w-4" /> Send Inquiry
                </Button>
                <Button
                  href={whatsappLink("Hi OnGo, I'd like a free consultation.")}
                  external
                  variant="whatsapp"
                  className="w-full sm:w-auto"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </Button>
              </div>

              {sent && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 flex items-center gap-2 text-sm text-emerald-400"
                >
                  <CheckCircle2 className="h-4 w-4" /> Thanks! We&apos;ve opened
                  WhatsApp so you can send your inquiry instantly.
                </motion.p>
              )}
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field({
  icon,
  error,
  children,
  alignTop,
}: {
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
  alignTop?: boolean;
}) {
  return (
    <div>
      <div className="relative">
        <span
          className={`pointer-events-none absolute left-4 text-slate-500 ${
            alignTop ? "top-4" : "top-1/2 -translate-y-1/2"
          }`}
        >
          {icon}
        </span>
        {children}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}
