"use client";

import { useEffect, useRef, useState } from "react";
import {
  useInView,
  useMotionValue,
  animate,
  useReducedMotion,
} from "framer-motion";

type Props = {
  value: number;
  suffix?: string;
  duration?: number;
};

export default function AnimatedCounter({
  value,
  suffix = "",
  duration = 1.8,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const motionVal = useMotionValue(0);
  const [display, setDisplay] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    // Skip the count-up for reduced-motion users — jump to the final value.
    if (reduce) {
      setDisplay(value);
      return;
    }
    const controls = animate(motionVal, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, duration, motionVal, reduce]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}
