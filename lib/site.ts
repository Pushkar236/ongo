// Single source of truth for brand-level constants.
export const site = {
  name: "OnGo",
  tagline: "Your Business. Online. OnGo.",
  description:
    "OnGo builds high-performance websites, e-commerce stores, and web applications that attract customers and grow revenue for startups, local businesses, and agencies.",
  // TODO: swap to your custom domain once connected in Vercel.
  url: "https://ongo-mauve.vercel.app",
  email: "pdkirange236@gmail.com",
  phoneDisplay: "+91 93258 68296",
  // Digits only, international format — used for the WhatsApp deep link.
  whatsapp: "919325868296",
  socials: {
    linkedin: "https://www.linkedin.com/in/pushkar-kirange-8b8a15298/",
    github: "https://github.com/Pushkar236",
  },
} as const;

export const whatsappLink = (message?: string) =>
  `https://wa.me/${site.whatsapp}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`;
