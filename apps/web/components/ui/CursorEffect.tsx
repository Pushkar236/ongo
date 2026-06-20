"use client";

import { useEffect, useRef, useState } from "react";

// A subtle trailing accent ring that follows the pointer. It is purely
// decorative: the NATIVE cursor is left fully visible and functional, so the
// site never ends up "cursorless" if anything about the ring misbehaves.
// Auto-disabled on touch devices and for reduced-motion users.
export default function CursorEffect() {
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!finePointer || reduced) return;
    setEnabled(true);

    const ring = ringRef.current;
    if (!ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let scale = 1;
    let targetScale = 1;
    let shown = false;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!shown) {
        shown = true;
        ring.style.opacity = "1";
      }
    };

    const isInteractive = (el: EventTarget | null) =>
      el instanceof Element &&
      !!el.closest("a, button, input, textarea, [data-cursor='hover']");

    const onOver = (e: MouseEvent) => {
      targetScale = isInteractive(e.target) ? 1.6 : 1;
    };

    const onLeave = () => {
      shown = false;
      ring.style.opacity = "0";
    };

    const loop = () => {
      // Smooth trailing follow + eased scale.
      ringX += (mouseX - ringX) * 0.2;
      ringY += (mouseY - ringY) * 0.2;
      scale += (targetScale - scale) * 0.2;
      // 40px ring → offset by 20px to centre it on the pointer.
      ring.style.transform = `translate3d(${ringX - 20}px, ${ringY - 20}px, 0) scale(${scale})`;
      ring.classList.toggle("cursor-ring--active", targetScale > 1.2);
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    document.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="cursor-ring pointer-events-none fixed left-0 top-0 z-[9999] h-10 w-10 rounded-full border border-brand-cyan/70 opacity-0 transition-[border-color,background-color,opacity] duration-300"
      />
      <style jsx global>{`
        .cursor-ring--active {
          border-color: rgba(139, 92, 246, 0.9);
          background-color: rgba(6, 182, 212, 0.08);
        }
      `}</style>
    </>
  );
}
