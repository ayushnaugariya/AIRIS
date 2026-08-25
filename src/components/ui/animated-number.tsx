"use client";

import { animate, useMotionValue } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AnimatedNumberProps {
  value: number;
  format?: (v: number) => string;
  className?: string;
}

/** Smoothly counts between values — used for live KPI ticks. */
export function AnimatedNumber({ value, format = (v) => v.toFixed(1), className }: AnimatedNumberProps) {
  const mv = useMotionValue(value);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.7, ease: "easeOut" });
    const unsub = mv.on("change", (v) => {
      if (ref.current) ref.current.textContent = format(v);
    });
    return () => {
      controls.stop();
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span ref={ref} className={cn("num", className)}>
      {format(value)}
    </span>
  );
}
