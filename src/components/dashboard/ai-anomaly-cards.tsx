"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { Anomaly } from "@/types";
import { formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * "AI Anomaly Detect" highlights — the overview's WHY surface.
 * Each card: sector, deviation, flight numbers in scope, model one-liner.
 */
export function AiAnomalyCards({ anomalies, limit = 3 }: { anomalies: Anomaly[]; limit?: number }) {
  const top = anomalies.slice(0, limit);
  return (
    <div className="flex h-full flex-col">
      <ul className="flex-1 divide-y divide-border">
        {top.map((a) => (
          <li key={a.id}>
            <Link
              href={`/anomalies?focus=${a.id}`}
              className="group block rounded-md px-1 py-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold tracking-tight num">
                    {a.routeLabel.split(" → ")[0]}–{a.routeLabel.split(" → ")[1]}
                  </p>
                  <p className="mt-0.5 flex flex-wrap gap-1">
                    {a.flightsInScope.slice(0, 2).map((f) => (
                      <span key={f} className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-accent num">
                        {f}
                      </span>
                    ))}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-md border px-1.5 py-0.5 text-[11px] font-bold num",
                    a.deviationPp > 0 ? "border-danger/30 bg-danger/10 text-danger" : "border-success/30 bg-success/10 text-success"
                  )}
                >
                  {formatPct(a.actualPct)}
                </span>
              </div>
              <p className="mt-2 flex items-start gap-1.5 rounded-md border border-border bg-background/50 px-2 py-1.5 text-[10px] leading-relaxed text-muted-foreground">
                <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                <span className="line-clamp-2">
                  {a.contributors[0]?.factor}: {a.contributors[0]?.detail}
                </span>
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/anomalies" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:opacity-80">
        View all detections <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
