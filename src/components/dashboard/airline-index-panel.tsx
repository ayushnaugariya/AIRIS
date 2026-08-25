"use client";

import type { AirlineIndex } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { TrendPill } from "@/components/ui/trend-pill";
import { formatIndex, formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";

interface AirlineIndexPanelProps {
  data: AirlineIndex[];
  /** Airline code to emphasize; others dim (from the global topbar filter). */
  highlight?: string;
}

/** Carrier-level index rows — full names, share/OTP subline, pressure badge. */
export function AirlineIndexPanel({ data, highlight }: AirlineIndexPanelProps) {
  return (
    <div>
      <div className="mb-1 grid grid-cols-[minmax(0,1fr)_46px_66px_88px] items-center gap-2">
        <span className="label-xs">Carrier</span>
        <span className="label-xs text-right">Index</span>
        <span className="label-xs text-right">7D</span>
        <span className="label-xs text-center">Pressure</span>
      </div>
      <ul className="divide-y divide-border">
        {data.map((a) => {
          const dim = highlight && highlight !== "all" && highlight !== a.code;
          return (
            <li
              key={a.code}
              className={cn(
                "grid grid-cols-[minmax(0,1fr)_46px_66px_88px] items-center gap-2 py-2.5 transition-opacity",
                dim && "opacity-35"
              )}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: a.color }} aria-hidden />
                  <span className="truncate text-xs font-semibold">{a.name}</span>
                  <span className="shrink-0 rounded-sm bg-muted px-1 text-[9px] font-bold text-muted-foreground num">
                    {a.code}
                  </span>
                </div>
                <p className="mt-0.5 truncate pl-3.5 text-[10px] text-muted-foreground num">
                  {a.marketSharePct}% share · OTP {a.onTimePct.toFixed(1)}% · 30d {formatPct(a.change30dPct)}
                </p>
              </div>
              <span className="text-right text-sm font-semibold num">{formatIndex(a.index)}</span>
              <TrendPill value={a.change7dPct} size="xs" className="justify-end" />
              <StatusBadge level={a.pressureLevel} size="sm" className="justify-center" />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
