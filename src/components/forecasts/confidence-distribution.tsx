"use client";

import type { ConfidenceDistribution } from "@/types";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";

const LEVEL_BAR: Record<string, string> = { High: "bg-success", Medium: "bg-warning", Low: "bg-danger" };

/** Route-count split across forecast confidence tiers. */
export function ConfidenceDistributionPanel({ data }: { data: ConfidenceDistribution[] }) {
  const total = data.reduce((a, d) => a + d.routeCount, 0) || 1;
  return (
    <div>
      <div className="mb-3 flex h-2.5 overflow-hidden rounded-full bg-muted" aria-hidden>
        {data.map((d) => (
          <div key={d.level} className={cn("h-full", LEVEL_BAR[d.level])} style={{ width: `${(d.routeCount / total) * 100}%` }} />
        ))}
      </div>
      <ul className="space-y-3">
        {data.map((d) => (
          <li key={d.level} className="flex items-start gap-2.5">
            <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", LEVEL_BAR[d.level])} aria-hidden />
            <div className="min-w-0">
              <p className="text-xs font-medium">
                {d.level}
                <span className="ml-2 text-muted-foreground num">{formatNumber(d.routeCount)} routes</span>
                <span className="ml-2 text-muted-foreground num">{Math.round((d.routeCount / total) * 100)}%</span>
              </p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">{d.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
