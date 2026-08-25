"use client";

import { CheckCircle2, TriangleAlert } from "lucide-react";
import type { FareQualityDimension } from "@/types";

/** Normalization checklist — each dimension the engine enforces. */
export function QualityDimensions({ dimensions }: { dimensions: FareQualityDimension[] }) {
  return (
    <ul className="space-y-2">
      {dimensions.map((d, i) => (
        <li
          key={d.key}
          className="flex items-start gap-2.5 rounded-md border border-border/70 bg-background/40 px-3 py-2 transition-colors hover:border-border"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          {d.passed ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          ) : (
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          )}
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-medium">
              {d.label}
              {!d.passed && (
                <span className="rounded border border-warning/25 bg-warning/10 px-1 py-px text-[9px] font-semibold uppercase tracking-wide text-warning">
                  Advisory
                </span>
              )}
            </p>
            <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">{d.detail}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
