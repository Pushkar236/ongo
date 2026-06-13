// Single source of truth for brand-level constants.
export const site = {
  name: "OnGo",
  tagline: "Your Business. Online. OnGo.",
  description:
    "OnGo builds high-performance websites, e-commerce stores, and web applications that attract customers and grow revenue for startups, local businesses, and agencies.",
  url: "https://ongo.agency",
  email: "hello@ongo.agency",
  phoneDisplay: "+91 98765 43210",
  // Digits only, international format — used for the WhatsApp deep link.
  whatsapp: "919876543210",
  socials: {
    twitter: "https://twitter.com/",
    instagram: "https://instagram.com/",
    linkedin: "https://linkedin.com/",
    github: "https://github.com/",
    dribbble: "https://dribbble.com/",
  },
} as const;

export const whatsappLink = (message?: string) =>
  `https://wa.me/${site.whatsapp}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`;
