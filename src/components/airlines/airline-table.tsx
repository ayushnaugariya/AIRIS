"use client";

import type { AirlineIndex } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { TrendPill } from "@/components/ui/trend-pill";
import { Sparkline } from "@/components/ui/sparkline";
import { Term } from "@/components/ui/term";
import { formatIndex, formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Carrier comparison table — pricing power vs service reliability. */
export function AirlineTable({ data, highlight }: { data: AirlineIndex[]; highlight?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-xs">
        <thead>
          <tr className="border-b border-border">
            {["Carrier", "Share", <Term key="idx" t="airline-index">Index</Term>, "7D", "30D", <Term key="otp" t="otp">On-time</Term>, "Pressure", "Trend"].map((h, i) => (
              <th key={i} className={cn("label-xs whitespace-nowrap px-3 py-2 font-medium first:pl-0", ["Index", "7D", "30D", "On-time"].includes(String(h)) && "text-right")}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {data.map((a) => {
            const dim = highlight && highlight !== "all" && highlight !== a.code;
            return (
              <tr key={a.code} className={cn("transition-colors hover:bg-muted/40", dim && "opacity-30")}>
              <td className="whitespace-nowrap py-2.5 pl-0 pr-3">
                <span className="flex items-center gap-2">
                  <span
                    className="flex h-5 w-8 items-center justify-center rounded-sm text-[9px] font-bold text-white"
                    style={{ background: a.color }}
                  >
                    {a.code}
                  </span>
                  <span className="font-medium">{a.name}</span>
                </span>
              </td>
              <td className="whitespace-nowrap px-3 num">{a.marketSharePct}%</td>
              <td className="whitespace-nowrap px-3 text-right font-semibold num">{formatIndex(a.index)}</td>
              <td className="px-3"><TrendPill value={a.change7dPct} size="xs" /></td>
              <td className="px-3"><TrendPill value={a.change30dPct} size="xs" /></td>
              <td className={cn("whitespace-nowrap px-3 text-right font-medium num", a.onTimePct >= 80 ? "text-success" : "text-warning")}>
                {formatPct(a.onTimePct, { signed: false })}
              </td>
              <td className="px-3"><StatusBadge level={a.pressureLevel} size="sm" /></td>
              <td className="px-3 py-1">
                <Sparkline data={a.trend} stroke={a.color} width={84} height={26} />
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
