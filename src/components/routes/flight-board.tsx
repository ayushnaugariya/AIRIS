"use client";

import { useMemo, useState } from "react";
import { Crown, Plane } from "lucide-react";
import type { FlightDeal } from "@/types";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

const SOURCES = ["Airline direct", "MakeMyTrip", "Cleartrip", "EaseMyTrip", "Yatra"] as const;

type SortMode = "departure" | "cheapest";

/**
 * Full flight board for a sector: every scheduled non-stop with live prices
 * on each captured website. Green cell = cheapest quote on the row.
 */
export function FlightBoard({ flights }: { flights: FlightDeal[] }) {
  const [sort, setSort] = useState<SortMode>("departure");

  const rows = useMemo(() => {
    const copy = [...flights];
    if (sort === "cheapest") return copy.sort((a, b) => a.bestFare - b.bestFare);
    return copy.sort((a, b) => a.depTime.localeCompare(b.depTime));
  }, [flights, sort]);

  const boardBest = Math.min(...flights.map((f) => f.bestFare));

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Plane className="h-3.5 w-3.5" />
          {flights.length} scheduled non-stops today · prices captured across {SOURCES.length} websites ·
          <span className="font-semibold text-success">green = cheapest</span>
        </p>
        <div className="inline-flex rounded-md bg-muted p-0.5" role="group" aria-label="Sort flights">
          {(
            [
              { key: "departure", label: "By departure" },
              { key: "cheapest", label: "By price" },
            ] as const
          ).map((m) => (
            <button
              key={m.key}
              onClick={() => setSort(m.key)}
              aria-pressed={sort === m.key}
              className={cn(
                "rounded-sm px-2.5 py-1 text-[11px] font-medium transition-colors",
                sort === m.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-left text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="label-xs px-3 py-2 font-medium first:pl-0">Flight</th>
              <th className="label-xs px-3 py-2 font-medium">Dep</th>
              <th className="label-xs px-3 py-2 font-medium">Arr</th>
              <th className="label-xs px-3 py-2 font-medium">Duration</th>
              {SOURCES.map((s) => (
                <th key={s} className="label-xs whitespace-nowrap px-3 py-2 text-right font-medium">
                  {s === "Airline direct" ? "Direct" : s.replace("MyTrip", "MT").replace("EaseMyTrip", "EMT")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {rows.map((f) => {
              const isBoardBest = f.bestFare === boardBest;
              return (
                <tr key={f.flightNo} className="transition-colors hover:bg-muted/40">
                  <td className="whitespace-nowrap py-2.5 pl-0 pr-3">
                    <span className="flex items-center gap-1.5 font-bold num">
                      {f.flightNo}
                      {isBoardBest && <Crown className="h-3 w-3 text-warning" aria-label="Cheapest on board" />}
                    </span>
                    <span className="block text-[10px] text-muted-foreground">
                      {f.airline} · {f.aircraft}
                    </span>
                  </td>
                  <td className="px-3 num">{f.depTime}</td>
                  <td className="px-3 num">{f.arrTime}</td>
                  <td className="whitespace-nowrap px-3 text-muted-foreground num">{f.durationLabel}</td>
                  {SOURCES.map((s) => {
                    const q = f.quotes.find((x) => x.source === s);
                    const isRowBest = q && q.fare === f.bestFare;
                    return (
                      <td key={s} className="px-3 text-right">
                        <span
                          className={cn(
                            "inline-block rounded px-1.5 py-0.5 num",
                            isRowBest ? "bg-success/15 font-bold text-success" : "text-muted-foreground"
                          )}
                        >
                          {q ? formatINR(q.fare) : "—"}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
        Board best: <span className="font-semibold text-foreground num">{formatINR(boardBest)}</span> — quotes are
        timestamped captures, not bookable prices. Spread between websites on the same flight averages ₹
        {Math.round(
          flights.reduce((a, f) => a + (Math.max(...f.quotes.map((q) => q.fare)) - f.bestFare), 0) / flights.length
        )}
        , which is exactly the noise the normalization layer removes from the index.
      </p>
    </div>
  );
}
