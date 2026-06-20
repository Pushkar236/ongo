import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OnGo — Founder Command Center",
  description:
    "Operate like a 20-person software agency. Agents do the work; you make the decisions.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
