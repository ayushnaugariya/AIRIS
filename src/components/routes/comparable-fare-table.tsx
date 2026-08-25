"use client";

import { AlertTriangle, Info } from "lucide-react";
import type { ComparableFare } from "@/types";
import { formatINR } from "@/lib/format";

/**
 * Fare products on the same sector. The point: these are NOT identical
 * observations — the index only uses product-adjusted equivalents.
 */
export function ComparableFareTable({ fares }: { fares: ComparableFare[] }) {
  const base = fares[0]?.fare ?? 1;
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-xs">
          <thead>
            <tr className="border-b border-border">
              {["Product", "Cabin", "Baggage", "Refund", "Fare", "Δ vs base"].map((h) => (
                <th key={h} className="label-xs px-3 py-2 font-medium first:pl-0">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {fares.map((f) => {
              const delta = ((f.fare - base) / base) * 100;
              return (
                <tr key={f.product}>
                  <td className="px-3 py-2.5 pl-0">
                    <span className="block font-semibold">{f.product}</span>
                    <span className="mt-0.5 block max-w-[240px] truncate text-[10px] text-muted-foreground">{f.note}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">{f.cabin}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 num">{f.baggageKg} kg</td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <span className={f.refundable ? "text-warning" : "text-success"}>{f.refundable ? "Yes" : "No"}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-semibold num">{formatINR(f.fare)}</td>
                  <td className={`whitespace-nowrap px-3 py-2.5 font-semibold num ${delta > 0 ? "text-danger" : "text-muted-foreground"}`}>
                    {delta >= 0 ? "+" : ""}
                    {delta.toFixed(0)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-start gap-2 rounded-md border border-warning/25 bg-warning/[0.07] p-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">These are not identical observations.</span> A Flex Economy ticket and a
          Standard Economy ticket measure different products with different service levels. AIRIS normalizes cabin, baggage,
          cancellation and booking window before any fare enters the index — business-class fares are excluded entirely.
        </p>
      </div>
      <p className="mt-2 flex items-start gap-1.5 text-[10px] leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-3 w-3 shrink-0" />
        Product-adjusted equivalent fare is what enters the Laspeyres-style chained index computation.
      </p>
    </div>
  );
}
