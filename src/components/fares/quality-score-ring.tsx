"use client";

import { motion } from "framer-motion";

interface QualityScoreRingProps {
  score: number;
  maxScore?: number;
  grade?: string;
  size?: number;
}

/** Circular comparability gauge for the Fare Quality Engine. */
export function QualityScoreRing({ score, maxScore = 100, grade = "A", size = 148 }: QualityScoreRingProps) {
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  const frac = Math.min(1, score / maxScore);

  return (
    <div className="relative" style={{ width: size, height: size }} role="img" aria-label={`Fare comparability score ${score} out of ${maxScore}`}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="qRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#14B8A6" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(218 30% 14%)" strokeWidth="9" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#qRingGrad)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - frac) }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[34px] font-semibold leading-none tracking-tight num">
          {score}
          <span className="text-sm font-normal text-muted-foreground"> / {maxScore}</span>
        </span>
        <span className="mt-1 rounded border border-success/25 bg-success/10 px-1.5 py-px text-[9px] font-bold uppercase tracking-[0.1em] text-success">
          Grade {grade}
        </span>
      </div>
    </div>
  );
}
