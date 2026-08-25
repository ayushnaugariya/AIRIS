"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Anomaly } from "@/types";
import { SeverityBadge } from "@/components/anomalies/severity-badge";
import { formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";

interface RecentAnomaliesPanelProps {
  anomalies: Anomaly[];
  limit?: number;
}

/** Latest detections — the overview's "why" surface. */
export function RecentAnomaliesPanel({ anomalies, limit = 5 }: RecentAnomaliesPanelProps) {
  const latest = anomalies.slice(0, limit);
  return (
    <div>
      <ul className="divide-y divide-border">
        {latest.map((a) => (
          <li key={a.id}>
            <Link
              href={`/anomalies?focus=${a.id}`}
              className="group flex items-center gap-3 rounded-md px-1 py-2.5 transition-colors hover:bg-muted/60"
            >
              <span className="w-9 shrink-0 text-[11px] font-medium text-muted-foreground num">{a.timeLabel}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold tracking-tight">{a.routeLabel}</span>
                <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                  Expected {formatPct(a.expectedPct)} &middot; observed {formatPct(a.actualPct)}
                </span>
              </span>
              <SeverityBadge severity={a.severity} size="sm" />
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          </li>
        ))}
        {!latest.length && (
          <li className="py-8 text-center text-xs text-muted-foreground">No anomalies in the current window.</li>
        )}
      </ul>
      <Link
        href="/anomalies"
        className={cn(
          "mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary transition-opacity hover:opacity-80"
        )}
      >
        Open Anomaly Center <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
