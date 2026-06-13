"use client";

import { useEffect, useRef, useState } from "react";

// Custom animated cursor: a precise dot + a trailing ring that grows over
// interactive elements. Auto-disables on touch / reduced-motion devices.
export default function CursorEffect() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const canHover = window.matchMedia("(hover: hover)").matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!canHover || reduced) return;
    setEnabled(true);

    const dot = dotRef.current!;
    const ring = ringRef.current!;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate3d(${mouseX - 3}px, ${mouseY - 3}px, 0)`;
    };

    const isInteractive = (el: EventTarget | null) =>
      el instanceof Element &&
      !!el.closest("a, button, input, textarea, [data-cursor='hover']");

    const onOver = (e: MouseEvent) => {
      ring.classList.toggle("cursor-ring--active", isInteractive(e.target));
    };

    const loop = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate3d(${ringX - 18}px, ${ringY - 18}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="cursor-dot pointer-events-none fixed left-0 top-0 z-[9999] h-1.5 w-1.5 rounded-full bg-brand-cyan mix-blend-screen"
      />
      <div
        ref={ringRef}
        className="cursor-ring pointer-events-none fixed left-0 top-0 z-[9999] h-9 w-9 rounded-full border border-brand-cyan/60 transition-[width,height,background-color,border-color] duration-300 mix-blend-screen"
      />
      <style jsx global>{`
        .cursor-ring--active {
          background-color: rgba(6, 182, 212, 0.12);
          border-color: rgba(139, 92, 246, 0.8);
          width: 3.25rem;
          height: 3.25rem;
        }
        @media (hover: hover) {
          body {
            cursor: none;
          }
          a,
          button,
          input,
          textarea {
            cursor: none;
          }
        }
      `}</style>
    </>
  );
}
