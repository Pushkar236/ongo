# OnGo — Brand Guidelines

> **Your Business. Online. OnGo.**

The single source of truth for OnGo's identity. Keep every surface consistent
with this. Brand facts live in code at `lib/site.ts`; never hardcode them elsewhere.

## 1. Positioning
- **What we are:** a premium web-development & digital-solutions agency.
- **Who we serve:** startups, local businesses, entrepreneurs, agencies, SMBs.
- **Promise:** trustworthy, innovative, fast, professional — websites that *grow
  the business*, not just look good.

## 2. Logo
- Wordmark: **On** (white) + **Go** (brand gradient). Used in nav, footer, preloader.
- Monogram: **OG** on the brand gradient, rounded square (favicon / app icon / OG image).
- Keep clear space around the mark; never re-color, stretch, or add effects ad-hoc.

## 3. Color
| Token | Hex | Use |
|---|---|---|
| Primary / Blue | `#2563EB` | Primary actions, links, emphasis |
| Cyan | `#06B6D4` | Accents, highlights, icons |
| Purple | `#8B5CF6` | Tertiary accent, gradient end |
| Background | `#0F172A → #020617` | Dark gradient canvas |
| Text | `#FFFFFF` / `#CBD5E1` / `#94A3B8` | Headings / body / muted |

**Rule:** use Tailwind theme tokens (`brand-blue`, `brand-cyan`, `brand-purple`,
`ink-*`) — never stray hex values in components. Signature gradient:
`from-brand-blue via-brand-cyan to-brand-purple`. Keep muted text at `slate-300/400`
(not lighter-than-`slate-500` on dark) to hold WCAG AA contrast.

## 4. Typography
- **Display:** Bricolage Grotesque — headlines, logo, stats (`font-display`).
- **Body:** Plus Jakarta Sans — paragraphs, UI (`font-sans`).
- Tight tracking on large headings; generous line-height on body. Use
  `text-balance` on headlines.

## 5. Voice & Tone
- Confident, benefit-led, concise, modern. Talk **outcomes** (growth, revenue,
  customers, speed), not jargon.
- Headlines: punchy and specific. CTAs: action + value ("Get Free Consultation").
- Avoid: hype clichés, filler, generic AI phrasing, exclamation overload.

## 6. Motion
- Purposeful and smooth: scroll-reveals, hover springs, count-ups, floating blobs.
- GPU-friendly (transform/opacity). **Always** honor `prefers-reduced-motion`.
- One well-orchestrated entrance beats scattered micro-animations.

## 7. UI System
- Glassmorphism surfaces (`glass`, `glass-strong`), `card-glow` hover borders,
  consistent radii (`rounded-2xl/3xl`), Lucide icons at consistent weight/size.
- Reuse `components/ui/` primitives (Button, GlassCard, Reveal, SectionHeading…).

## 8. Assets / SEO
- Favicon & app icon: `app/icon.svg`. Social share: `app/opengraph-image.tsx`.
- Metadata + JSON-LD: `app/layout.tsx`. Update `lib/site.ts` (name, tagline,
  email, phone, WhatsApp, socials) — **replace placeholders before launch.**
