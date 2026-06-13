import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Nodemailer (SMTP) runs server-side only and needs the Node.js runtime.
// We also opt out of static optimization since this route performs an
// external side effect (sending an email).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Owner inbox that contact-form inquiries are delivered to.
const OWNER_EMAIL = "pdkirange236@gmail.com";

type ContactInput = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

// --- Lightweight in-memory rate limiting -------------------------------------
// Best-effort abuse brake for this unauthenticated, email-sending endpoint.
// NOTE: this is per-instance and resets on cold start / does not span the
// multiple serverless instances Vercel may spin up. It deters casual spam but
// is NOT a substitute for real, shared rate limiting (e.g. Upstash/Vercel KV)
// or a CAPTCHA — that remains an owner infra decision.
const RATE_LIMIT_MAX = 5; // requests
const RATE_LIMIT_WINDOW_MS = 60_000; // per minute, per IP
const hits = new Map<string, number[]>();

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  // Opportunistic cleanup so the map can't grow unbounded.
  if (hits.size > 5_000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) hits.delete(key);
    }
  }
  return recent.length > RATE_LIMIT_MAX;
}

// Mirror the client-side rules but treat the client as untrusted: we re-derive
// every constraint here. Email regex is intentionally simple/strict-enough.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LIMITS = { name: 100, email: 200, phone: 40, message: 5000 } as const;

// Strip control characters (incl. CR/LF/NUL) so values that flow into email
// headers (the subject) can't attempt header/control-char injection, and so
// the HTML body can't smuggle control bytes — independent of how the SDK
// assembles the MIME message.
// eslint-disable-next-line no-control-regex
const CONTROL_RE = /[\u0000-\u001F\u007F]/g;
const stripControl = (s: string) => s.replace(CONTROL_RE, " ");

function validate(body: unknown): { ok: true; data: ContactInput } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid request body." };
  }

  const raw = body as Record<string, unknown>;

  // Honeypot: hidden fields real users never fill in. If either has a value,
  // reject as spam. The caller maps this to a silent success so bots get no
  // signal. Accept a couple of common bot-bait field names.
  const honeypot =
    (typeof raw.company === "string" ? raw.company.trim() : "") ||
    (typeof raw.website === "string" ? raw.website.trim() : "");
  if (honeypot) return { ok: false, error: "__spam__" };

  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const email = typeof raw.email === "string" ? raw.email.trim() : "";
  const phone = typeof raw.phone === "string" ? raw.phone.trim() : "";
  const message = typeof raw.message === "string" ? raw.message.trim() : "";

  if (!name) return { ok: false, error: "Please enter your name." };
  if (name.length > LIMITS.name) return { ok: false, error: "Name is too long." };

  if (!EMAIL_RE.test(email)) return { ok: false, error: "Enter a valid email address." };
  if (email.length > LIMITS.email) return { ok: false, error: "Email is too long." };

  // Require at least 7 actual digits regardless of formatting characters.
  const digitCount = (phone.match(/\d/g) ?? []).length;
  if (digitCount < 7) return { ok: false, error: "Enter a valid phone number." };
  if (phone.length > LIMITS.phone) return { ok: false, error: "Phone number is too long." };

  if (message.length < 10) return { ok: false, error: "Tell us a little more (10+ characters)." };
  if (message.length > LIMITS.message) return { ok: false, error: "Message is too long." };

  return {
    ok: true,
    data: {
      name: stripControl(name).trim(),
      email: stripControl(email).trim(),
      phone: stripControl(phone).trim(),
      message,
    },
  };
}

// Escape user-supplied text before interpolating into HTML so the inquiry
// email can't be used to inject markup into the owner's inbox.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  // Lightweight per-IP rate limit before doing any work.
  if (rateLimited(clientIp(request))) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again in a minute." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const result = validate(body);
  if (!result.ok) {
    // Honeypot tripped: pretend success so bots get no useful signal.
    if (result.error === "__spam__") {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  const { name, email, phone, message } = result.data;

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  if (!gmailUser || !gmailPass) {
    // Misconfiguration — log server-side, never expose details to the client.
    console.error("[contact] GMAIL_USER / GMAIL_APP_PASSWORD is not set");
    return NextResponse.json(
      { ok: false, error: "Email service is unavailable. Please try again later." },
      { status: 500 },
    );
  }

  // `name` is control-stripped above, so the subject is safe from header
  // injection. The HTML body escapes every field.
  const subject = `New OnGo inquiry from ${name}`;
  const htmlBody = `
    <h2>New OnGo inquiry</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
    <p><strong>Message:</strong></p>
    <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
  `.trim();
  const textBody = `New OnGo inquiry\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\n\n${message}`;

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: gmailUser, pass: gmailPass },
    });

    await transporter.sendMail({
      from: `"OnGo Website" <${gmailUser}>`,
      to: OWNER_EMAIL,
      replyTo: email, // replies go straight to the visitor
      subject,
      text: textBody,
      html: htmlBody,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    // Log full detail server-side only; the client gets a generic message so
    // we never leak credentials, the stack trace, or SMTP internals.
    console.error("[contact] Unexpected error sending inquiry:", err);
    return NextResponse.json(
      { ok: false, error: "We couldn't send your inquiry. Please try again." },
      { status: 500 },
    );
  }
}
