import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Bricolage_Grotesque } from "next/font/google";
import { MotionConfig } from "framer-motion";
import "./globals.css";
import { site } from "@/lib/site";
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
    "web development",
    "web design agency",
    "e-commerce development",
    "custom web applications",
    "landing pages",
    "SEO",
    "OnGo",
  ],
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
  "@type": "Organization",
  name: site.name,
  url: site.url,
  description: site.description,
  email: site.email,
  slogan: site.tagline,
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
