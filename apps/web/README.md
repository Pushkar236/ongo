# OnGo — Premium Web Development Agency Website

> **Your Business. Online. OnGo.**

A modern, single-page agency website built with a premium SaaS aesthetic —
glassmorphism, animated gradients, floating blobs, a custom cursor,
scroll-triggered motion, and a conversion-focused layout.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS** (custom brand theme)
- **Framer Motion** (animations)
- **Lucide React** (icons)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build + typecheck
npm run start   # serve the production build
```

## Project Structure

```
app/
  layout.tsx        # fonts, SEO metadata, JSON-LD, cursor + preloader
  page.tsx          # assembles every section in order
  globals.css       # Tailwind layers, glass utilities, gradient text, scrollbar
components/
  Navbar.tsx        # sticky glass nav, scroll progress, mobile menu
  Hero.tsx          # headline, CTAs, floating shapes, gradient mesh
  About.tsx         # mission + 4 feature cards + stats strip
  Services.tsx      # 6 service cards with hover glow
  WhyChoose.tsx     # animated stat counters
  Pricing.tsx       # 3 plans, Business highlighted "Most Popular"
  Portfolio.tsx     # 6 project cards with hover previews
  Testimonials.tsx  # 3 client testimonials with ratings
  Contact.tsx       # validated form + WhatsApp + Send Inquiry
  Footer.tsx        # logo, links, services, socials, copyright
  ui/               # reusable primitives (Button, GlassCard, Reveal,
                    #   SectionHeading, AnimatedCounter, FloatingBlobs,
                    #   CursorEffect, Preloader)
lib/
  data.ts           # services, pricing, portfolio, testimonials, nav
  site.ts           # brand constants + WhatsApp helper
```

## Customizing

- **Brand details** (name, tagline, phone, WhatsApp number, email, socials):
  edit `lib/site.ts`. The WhatsApp number drives every "Chat" / form CTA.
- **Content** (services, pricing, portfolio, testimonials, nav): edit `lib/data.ts`.
- **Colors / theme**: edit `tailwind.config.ts` and the CSS variables in `app/globals.css`.

## Notes

- The contact form has no backend in this build — on submit it opens a
  pre-filled WhatsApp chat. Wire it to an API route / form service for real leads.
- All animations respect `prefers-reduced-motion`; the custom cursor disables
  itself on touch devices.
- Portfolio previews and avatars use CSS gradients / initials (no external
  images) to keep the Lighthouse score high and the bundle light.
