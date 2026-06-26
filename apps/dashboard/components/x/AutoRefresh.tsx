"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Periodically re-renders the server components on the page by calling
 * router.refresh() — the cheapest way to make feeds + the live agent view
 * feel alive without new endpoints. Pauses while the tab is hidden.
 */
export function AutoRefresh({ interval = 10000 }: { interval?: number }) {
  const router = useRouter();
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      stop();
      timer = setInterval(() => {
        if (!document.hidden) router.refresh();
      }, interval);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else {
        router.refresh();
        start();
      }
    };
    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [interval, router]);
  return null;
}
