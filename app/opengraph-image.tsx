import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

// Dynamically generated social share image (also used for Twitter cards).
export const alt = "OnGo — We Build Websites That Grow Your Business";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "radial-gradient(1200px 500px at 50% -10%, rgba(37,99,235,0.45), transparent), linear-gradient(135deg, #0F172A 0%, #020617 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #2563EB, #06B6D4, #8B5CF6)",
              color: "#fff",
              fontSize: "32px",
              fontWeight: 800,
            }}
          >
            OG
          </div>
          <div style={{ display: "flex", fontSize: "34px", fontWeight: 800, color: "#fff" }}>
            On
            <span
              style={{
                background: "linear-gradient(135deg, #2563EB, #06B6D4, #8B5CF6)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              Go
            </span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: "76px",
              fontWeight: 800,
              lineHeight: 1.05,
              color: "#fff",
              letterSpacing: "-2px",
            }}
          >
            We Build Websites That Grow Your Business
          </div>
          <div style={{ display: "flex", fontSize: "30px", color: "#94A3B8" }}>
            {site.tagline}
          </div>
        </div>

        {/* Accent bar */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "10px",
            borderRadius: "9999px",
            background: "linear-gradient(90deg, #2563EB, #06B6D4, #8B5CF6)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
