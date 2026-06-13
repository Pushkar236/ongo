import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Bricolage_Grotesque } from "next/font/google";
import { MotionConfig } from "framer-motion";
import "./globals.css";
import { site } from "@/lib/site";
import { services, testimonials } from "@/lib/data";
import CursorEffect from "@/components/ui/CursorEffect";
import Preloader from "@/components/ui/Preloader";

// Refined, characterful pairing — a distinctive grotesque display face with a
// warm, highly-legible body face (deliberately avoiding generic Inter/Roboto).
const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — We Build Websites That Grow Your Business`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [
    "web development agency",
    "website design",
    "custom website development",
    "e-commerce development",
    "web application development",
    "landing page design",
    "website redesign",
    "website maintenance",
    "SEO services",
    "small business website",
    "affordable web design India",
    "OnGo",
  ],
  alternates: { canonical: "/" },
  authors: [{ name: site.name }],
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: site.url,
    siteName: site.name,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${site.url}/#organization`,
      name: site.name,
      url: site.url,
      description: site.description,
      email: site.email,
      slogan: site.tagline,
      logo: `${site.url}/icon.svg`,
      image: `${site.url}/opengraph-image`,
      sameAs: Object.values(site.socials),
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: site.name,
      inLanguage: "en",
      publisher: { "@id": `${site.url}/#organization` },
    },
    {
      "@type": "ProfessionalService",
      "@id": `${site.url}/#service`,
      name: site.name,
      url: site.url,
      description: site.description,
      image: `${site.url}/opengraph-image`,
      priceRange: "₹₹",
      parentOrganization: { "@id": `${site.url}/#organization` },
      areaServed: [
        { "@type": "Country", name: "India" },
        { "@type": "Place", name: "Worldwide" },
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5",
        reviewCount: String(testimonials.length),
        bestRating: "5",
      },
      review: testimonials.map((t) => ({
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: String(t.rating),
          bestRating: "5",
        },
        author: { "@type": "Person", name: t.name },
        reviewBody: t.quote,
      })),
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Web Development Services",
        itemListElement: services.map((s) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: s.title,
            description: s.description,
          },
        })),
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <body className="font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Fine grain overlay for depth — sits above the page, ignores input */}
        <div className="grain-overlay" aria-hidden />
        {/* reducedMotion="user" disables transform/loop animations (e.g. the
            infinite hero chips) for users who ask for it, keeping opacity fades */}
        <MotionConfig reducedMotion="user">
          <Preloader />
          <CursorEffect />
          {children}
        </MotionConfig>
      </body>
    </html>
  );
}
