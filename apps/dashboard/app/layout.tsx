import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OnGo — Agentic OS",
  description:
    "Your AI workforce, in one command center. Agents do the work; you make the calls.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-x-bg font-sans text-x-text antialiased">
        {children}
      </body>
    </html>
  );
}
