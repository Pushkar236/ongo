import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The dashboard talks to the OnGo Brain API over HTTP; no special config needed.
};

export default nextConfig;
