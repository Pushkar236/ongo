"use client";

// Decorative animated gradient blobs. Pure CSS keyframes (GPU transform/opacity)
// so they stay cheap and don't hurt Lighthouse. Hidden from assistive tech.
export default function FloatingBlobs({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-blue/30 blur-3xl animate-float-slow" />
      <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-brand-purple/25 blur-3xl animate-float-slow [animation-delay:-6s]" />
      <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-brand-cyan/25 blur-3xl animate-float-slow [animation-delay:-12s]" />
    </div>
  );
}
