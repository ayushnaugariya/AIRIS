"use client";

import { Term } from "@/components/ui/term";
import type { GlossaryKey } from "@/lib/glossary";
import { cn } from "@/lib/utils";

interface ConfidenceMeterProps {
  value: number;
  label?: string;
  info?: string;
  compact?: boolean;
}

/** Horizontal confidence gauge — teal ≥80, amber ≥65, red below. */
export function ConfidenceMeter({ value, label = "Confidence", info, compact }: ConfidenceMeterProps) {
  const tone = value >= 80 ? "bg-success" : value >= 65 ? "bg-warning" : "bg-danger";
  const textTone = value >= 80 ? "text-success" : value >= 65 ? "text-warning" : "text-danger";
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="label-xs">{info ? <Term t={info as GlossaryKey}>{label}</Term> : label}</span>
        <span className={cn("text-sm font-bold num", textTone)}>{value}%</span>
      </div>
      <div className={cn("mt-1.5 overflow-hidden rounded-full bg-muted", compact ? "h-1" : "h-1.5")} aria-hidden>
        <div className={cn("h-full rounded-full transition-all duration-500", tone)} style={{ width: `${value}%` }} />
      </div>
      <div className="mt-1 flex justify-between text-[9px] uppercase tracking-[0.08em] text-muted-foreground/70">
        <span>0</span><span>50</span><span>100</span>
      </div>
    </div>
  );
}
