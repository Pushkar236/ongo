"use client";

// Infinite marquee of capabilities — adds motion and a "premium agency" signal.
// The track is duplicated so the -50% translate loops seamlessly.
const items = [
  "Next.js",
  "React",
  "E-Commerce",
  "SEO",
  "Tailwind CSS",
  "Web Apps",
  "UI / UX",
  "Performance",
  "CMS",
  "Booking Systems",
  "Analytics",
  "Conversion",
];

export default function TrustBar() {
  return (
    <section
      aria-label="Capabilities"
      className="relative border-y border-white/10 bg-white/[0.02] py-6"
    >
      <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
        <div className="flex shrink-0 animate-marquee items-center gap-12 pr-12">
          {[...items, ...items].map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-12 whitespace-nowrap font-display text-lg font-semibold text-slate-400"
            >
              {item}
              <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan/60" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
