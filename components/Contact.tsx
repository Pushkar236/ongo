"use client";

import { useState, type FormEvent, type ReactNode } from "react";
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
  // Honeypot: hidden from real users; only bots that auto-fill every input
  // will populate it. A non-empty value flags the submission as spam.
  const [company, setCompany] = useState("");
  const [errors, setErrors] = useState<Partial<Fields>>({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  // "email" = inquiry was emailed to the owner via the backend.
  // "whatsapp" = backend failed, so we fell back to the WhatsApp deep link.
  const [mode, setMode] = useState<"email" | "whatsapp">("email");
  // Holds the prefilled WhatsApp URL so we can show a manual link if the
  // browser blocks the popup that the WhatsApp fallback tries to open.
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);

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

  // Open the prefilled WhatsApp chat as the fallback channel. If the popup is
  // blocked we surface a clickable link instead of failing silently.
  const openWhatsAppFallback = (current: Fields) => {
    const msg = `Hi OnGo! I'm ${current.name}.\nEmail: ${current.email}\nPhone: ${current.phone}\n\n${current.message}`;
    const url = whatsappLink(msg);
    const win = window.open(url, "_blank", "noopener,noreferrer");
    setFallbackUrl(win ? null : url);
    setMode("whatsapp");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate() || sending) return;

    const current = fields;
    setSending(true);
    setSent(false);
    setFallbackUrl(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...current, company }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;

      if (res.ok && data?.ok) {
        // Email delivered to the owner via the backend.
        setMode("email");
        setFallbackUrl(null);
        setFields(empty);
      } else {
        // Backend rejected/failed — gracefully fall back to WhatsApp.
        openWhatsAppFallback(current);
      }
    } catch {
      // Network error — fall back to WhatsApp.
      openWhatsAppFallback(current);
    } finally {
      setSending(false);
      setSent(true);
      setTimeout(() => setSent(false), 8000);
    }
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
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
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
                          <Icon className="h-5 w-5 text-brand-cyan" aria-hidden />
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
                        className="block transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
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
                    <MessageCircle className="h-4 w-4" aria-hidden /> Chat on WhatsApp
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
              aria-label="Project inquiry form"
              className="card-glow glass rounded-3xl p-8 sm:p-10"
            >
              {/* Honeypot field — hidden from real users, off the tab order and
                  the a11y tree. Bots that fill every input get flagged as spam. */}
              <div aria-hidden className="hidden">
                <label htmlFor="contact-company">Company</label>
                <input
                  id="contact-company"
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  id="contact-name"
                  label="Your name"
                  icon={<User className="h-4 w-4" aria-hidden />}
                  error={errors.name}
                >
                  {({ id, describedBy, invalid }) => (
                    <input
                      id={id}
                      type="text"
                      autoComplete="name"
                      placeholder="Your name"
                      aria-invalid={invalid}
                      aria-describedby={describedBy}
                      value={fields.name}
                      onChange={(e) => update("name", e.target.value)}
                      className={`${inputBase} ${
                        errors.name ? "border-red-500/60" : "border-white/10"
                      }`}
                    />
                  )}
                </Field>
                <Field
                  id="contact-phone"
                  label="Phone number"
                  icon={<Phone className="h-4 w-4" aria-hidden />}
                  error={errors.phone}
                >
                  {({ id, describedBy, invalid }) => (
                    <input
                      id={id}
                      type="tel"
                      autoComplete="tel"
                      placeholder="Phone number"
                      aria-invalid={invalid}
                      aria-describedby={describedBy}
                      value={fields.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      className={`${inputBase} ${
                        errors.phone ? "border-red-500/60" : "border-white/10"
                      }`}
                    />
                  )}
                </Field>
              </div>

              <div className="mt-5">
                <Field
                  id="contact-email"
                  label="Email address"
                  icon={<Mail className="h-4 w-4" aria-hidden />}
                  error={errors.email}
                >
                  {({ id, describedBy, invalid }) => (
                    <input
                      id={id}
                      type="email"
                      autoComplete="email"
                      placeholder="Email address"
                      aria-invalid={invalid}
                      aria-describedby={describedBy}
                      value={fields.email}
                      onChange={(e) => update("email", e.target.value)}
                      className={`${inputBase} ${
                        errors.email ? "border-red-500/60" : "border-white/10"
                      }`}
                    />
                  )}
                </Field>
              </div>

              <div className="mt-5">
                <Field
                  id="contact-message"
                  label="Project details"
                  icon={<MessageSquare className="h-4 w-4" aria-hidden />}
                  error={errors.message}
                  alignTop
                >
                  {({ id, describedBy, invalid }) => (
                    <textarea
                      id={id}
                      rows={5}
                      placeholder="Tell us about your project…"
                      aria-invalid={invalid}
                      aria-describedby={describedBy}
                      value={fields.message}
                      onChange={(e) => update("message", e.target.value)}
                      className={`${inputBase} resize-none ${
                        errors.message ? "border-red-500/60" : "border-white/10"
                      }`}
                    />
                  )}
                </Field>
              </div>

              <div className="mt-7 flex flex-col items-center gap-4 sm:flex-row">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full sm:w-auto"
                  disabled={sending}
                  aria-busy={sending}
                >
                  <Send className="h-4 w-4" aria-hidden />{" "}
                  {sending ? "Sending…" : "Send Inquiry"}
                </Button>
                <Button
                  href={whatsappLink("Hi OnGo, I'd like a free consultation.")}
                  external
                  variant="whatsapp"
                  className="w-full sm:w-auto"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
                </Button>
              </div>

              {/* Live region so screen readers announce the result */}
              <div aria-live="polite" role="status">
                {sent && (
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-emerald-400"
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden />
                    {mode === "email"
                      ? "Thanks! Your inquiry is on its way — we'll reply within 24 hours."
                      : "Thanks! We've opened WhatsApp so you can send your inquiry instantly."}
                    {fallbackUrl && (
                      <a
                        href={fallbackUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-brand-cyan underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
                      >
                        Didn&apos;t open? Tap here.
                      </a>
                    )}
                  </motion.p>
                )}
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

type FieldRenderProps = {
  id: string;
  describedBy?: string;
  invalid: boolean;
};

function Field({
  id,
  label,
  icon,
  error,
  alignTop,
  children,
}: {
  id: string;
  label: string;
  icon: ReactNode;
  error?: string;
  alignTop?: boolean;
  children: (props: FieldRenderProps) => ReactNode;
}) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <span
          className={`pointer-events-none absolute left-4 text-slate-500 ${
            alignTop ? "top-4" : "top-1/2 -translate-y-1/2"
          }`}
        >
          {icon}
        </span>
        {children({
          id,
          describedBy: error ? errorId : undefined,
          invalid: !!error,
        })}
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
