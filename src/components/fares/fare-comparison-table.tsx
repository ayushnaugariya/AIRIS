"use client";

import { useState } from "react";
import { ShieldCheck, XCircle } from "lucide-react";
import type { FareObservation } from "@/types";
import { formatINR, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Observation-level quality table. Toggle compares raw OTA prices against
 * the normalized equivalent that actually enters the index.
 */
export function FareComparisonTable({ observations }: { observations: FareObservation[] }) {
  const [normalized, setNormalized] = useState(true);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-md bg-muted p-0.5" role="group" aria-label="Fare view mode">
          {(
            [
              { key: false, label: "Raw captured" },
              { key: true, label: "Normalized" },
            ] as const
          ).map((m) => (
            <button
              key={String(m.key)}
              onClick={() => setNormalized(m.key)}
              aria-pressed={normalized === m.key}
              className={cn(
                "rounded-sm px-3 py-1.5 text-xs font-medium transition-colors",
                normalized === m.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-success" />
          {normalized
            ? "Product-adjusted equivalents — what the index consumes"
            : "Exactly as captured from portals, before normalization"}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-left text-xs">
          <thead>
            <tr className="border-b border-border">
              {["Source", "Flight", "Dep → Arr", "Cabin", "Baggage", "Cancellation", "Total fare", "Quality"].map((h) => (
                <th key={h} className="label-xs whitespace-nowrap px-3 py-2 font-medium first:pl-0">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {observations.map((o) => {
              const shownFare = normalized ? o.normalizedFare : o.totalFare;
              const adjusted = o.totalFare !== o.normalizedFare;
              return (
                <tr key={o.id} className="transition-colors hover:bg-muted/40">
                  <td className="whitespace-nowrap py-2.5 pl-0 pr-3">
                    <span className="block font-medium">{o.source}</span>
                    <span className="block text-[10px] text-muted-foreground num">{formatTime(new Date(o.capturedAt))}</span>
                  </td>
                  <td className="whitespace-nowrap px-3">
                    <span className="block font-semibold num">{o.flightNo}</span>
                    <span className="block text-[10px] text-muted-foreground">{o.airline}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 num">
                    {o.depTime} → {o.arrTime}
                    <span className="ml-1 text-[10px] text-muted-foreground">IST</span>
                  </td>
                  <td className="whitespace-nowrap px-3">{o.cabin}</td>
                  <td className="whitespace-nowrap px-3 num">{o.baggageKg} kg</td>
                  <td className="whitespace-nowrap px-3">
                    <span className={o.cancellation === "Refundable" ? "text-warning" : ""}>{o.cancellation}</span>
                  </td>
                  <td className="whitespace-nowrap px-3">
                    <span className={cn("font-semibold num", normalized && adjusted && "text-success")}>{formatINR(shownFare)}</span>
                    {adjusted && normalized ? (
                      <span className="ml-1.5 text-[10px] text-muted-foreground line-through num">{formatINR(o.totalFare)}</span>
                    ) : null}
                  </td>
                  <td className="px-3">
                    <QualityChip score={scoreFor(o)} />
                    {!normalized && o.issues.length > 0 && (
                      <span className="ml-1.5 inline-flex max-w-[150px] items-center gap-1 align-middle text-[10px] text-warning">
                        <XCircle className="h-3 w-3 shrink-0" />
                        <span className="truncate">{o.issues[0]}</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function scoreFor(o: FareObservation): number {
  let s = 96;
  if (o.totalFare !== o.normalizedFare) s -= 4 + o.issues.length;
  if (!o.verified) s -= 6;
  return Math.max(60, s);
}

function QualityChip({ score }: { score: number }) {
  const tone =
    score >= 93
      ? "border-success/25 bg-success/10 text-success"
      : score >= 85
        ? "border-accent/25 bg-accent/10 text-accent"
        : "border-warning/30 bg-warning/10 text-warning";
  return (
    <span className={cn("inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-bold num", tone)}>
      {score}
    </span>
  );
}
