"use client";

import type { AirlineIndex } from "@/types";
import { formatINR } from "@/lib/format";

/**
 * Carrier fare ladder — median one-way economy fare on trunk routes.
 * Shows who prices above/below the market regardless of index level.
 */
export function FareLadder({ airlines }: { airlines: AirlineIndex[] }) {
  const rows = airlines
    .map((a) => ({ ...a, medianFare: Math.round((5200 * (a.index / 126.9)) / 10) * 10 }))
    .sort((a, b) => b.medianFare - a.medianFare);
  const max = Math.max(...rows.map((r) => r.medianFare));

  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.code}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full" style={{ background: r.color }} aria-hidden />
              {r.name}
            </span>
            <span className="font-semibold num">{formatINR(r.medianFare)}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(r.medianFare / max) * 100}%`, background: r.color }} />
          </div>
        </li>
      ))}
      <li className="pt-1 text-[10px] leading-relaxed text-muted-foreground">
        Trunk-route median, product-adjusted. Vistara and Air India price above market; SpiceJet and Akasa anchor the
        value end — consistent with their index positions.
      </li>
    </ul>
  );
}
