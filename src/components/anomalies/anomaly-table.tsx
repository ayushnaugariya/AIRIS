"use client";

import type { Anomaly } from "@/types";
import { SeverityBadge } from "./severity-badge";
import { formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";

interface AnomalyTableProps {
  anomalies: Anomaly[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/**
 * Detection log. Rows are keyboard-focusable; selecting a row drives the
 * explanation panel on the right.
 */
export function AnomalyTable({ anomalies, selectedId, onSelect }: AnomalyTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="border-b border-border">
            {["Time", "Route", "Index Δ", "Expected", "Actual", "Severity", "Explanation"].map((h) => (
              <th key={h} className="label-xs whitespace-nowrap px-3 py-2 font-medium first:pl-1">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {anomalies.map((a) => {
            const selected = a.id === selectedId;
            return (
              <tr
                key={a.id}
                tabIndex={0}
                aria-selected={selected}
                onClick={() => onSelect(a.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(a.id);
                  }
                }}
                className={cn(
                  "cursor-pointer border-b border-border/60 outline-none transition-colors",
                  selected ? "bg-primary/[0.07]" : "hover:bg-muted/50"
                )}
              >
                <td className={cn("relative whitespace-nowrap py-2.5 pl-1 pr-3 text-xs text-muted-foreground num")}>
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 rounded-full bg-primary transition-opacity",
                      selected ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {a.dayLabel === "Today" ? "" : "Yst. "}
                  {a.timeLabel}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold tracking-tight">{a.routeLabel}</td>
                <td className={cn("px-3 py-2.5 text-xs font-semibold num", a.deviationPp > 0 ? "text-danger" : "text-success")}>
                  {formatPct(a.indexChangePct)}
                </td>
                <td className="px-3 py-2.5 text-xs text-muted-foreground num">{formatPct(a.expectedPct)}</td>
                <td className="px-3 py-2.5 text-xs font-semibold num">{formatPct(a.actualPct)}</td>
                <td className="px-3 py-2.5">
                  <SeverityBadge severity={a.severity} size="sm" />
                </td>
                <td className="max-w-[280px] px-3 py-2.5 text-[11px] leading-snug text-muted-foreground">
                  <span className="line-clamp-2">{a.contributors.map((c) => c.factor).join(" · ")}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
