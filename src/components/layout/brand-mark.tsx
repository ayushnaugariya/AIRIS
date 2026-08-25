"use client";

import { cn } from "@/lib/utils";

interface BrandMarkProps {
  size?: number;
  className?: string;
}

/**
 * AIRIS mark — an ascending index line that resolves into a flight-path
 * arrow, over a data-dot grid and a dashed flight arc. Air travel + data
 * + intelligence in one glyph.
 */
export function BrandMark({ size = 32, className }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id="airisBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#132A52" />
          <stop offset="100%" stopColor="#0B1220" />
        </linearGradient>
        <linearGradient id="airisLine" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
      </defs>

      <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" fill="url(#airisBg)" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" stroke="#38BDF8" strokeOpacity="0.4" />

      {/* data dots */}
      <circle cx="7" cy="25" r="1" fill="#334E7F" />
      <circle cx="12" cy="25" r="1" fill="#334E7F" />
      <circle cx="17" cy="25" r="1" fill="#334E7F" />

      {/* ascending index line */}
      <path
        d="M6 21.5L11.5 15.5L15.5 18L21.5 9.5"
        stroke="url(#airisLine)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* flight-path arrowhead */}
      <path d="M21.5 9.5L26.5 6.5L24.5 12L21.5 9.5Z" fill="#7DD3FC" />
      <path d="M26.5 6.5L24.5 12L21.8 10.6L26.5 6.5Z" fill="#38BDF8" />

      {/* dashed flight arc */}
      <path d="M6.5 27C12.5 24.6 20.5 24.6 26 27" stroke="#94A3B8" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="2.4 3" opacity="0.7" />
    </svg>
  );
}
