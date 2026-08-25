"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { ROUTES } from "@/lib/mock/routes-data";
import { useLive } from "@/components/providers/live-provider";
import { StatusBadge } from "@/components/ui/status-badge";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { formatINR, formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";

interface FeedRow {
  routeId: string;
  originCode: string;
  destinationCode: string;
  originCity: string;
  destinationCity: string;
  base: number;
  current: number;
  changePct: number;
  pressureLevel: "low" | "moderate" | "elevated" | "high";
  flights: string[];
  lastDelta: number;
}

const FEED_ROWS = 12;

/**
 * Live Route Intelligence Feed — every sector repricing in near-real-time.
 * Rows stream via the WebSocket abstraction; fares tick live on screen.
 */
export function LiveRouteFeed() {
  const { subscribe } = useLive();
  const [tickCount, setTickCount] = useState(0);
  const rowsRef = useRef<Map<string, FeedRow>>(new Map());

  const initial = useMemo<FeedRow[]>(
    () =>
      [...ROUTES]
        .sort((a, b) => Math.abs(b.change7dPct) - Math.abs(a.change7dPct))
        .slice(0, FEED_ROWS)
        .map((r) => ({
          routeId: r.id,
          originCode: r.originCode,
          destinationCode: r.destinationCode,
          originCity: r.originCity,
          destinationCity: r.destinationCity,
          base: r.avgFare90d,
          current: r.currentFare,
          changePct: r.change7dPct,
          pressureLevel: r.pressureLevel,
          flights: r.flights.slice(0, 2).map((f) => f.flightNo),
          lastDelta: 0,
        })),
    []
  );

  const [rows, setRows] = useState<FeedRow[]>(initial);

  useEffect(() => {
    rowsRef.current = new Map(initial.map((r) => [r.routeId, { ...r }]));
    const unsub = subscribe((event) => {
      if (event.type !== "route.tick") return;
      const row = rowsRef.current.get(event.routeId);
      if (!row) return;
      row.current = event.fare;
      row.lastDelta = event.deltaPct;
      row.changePct = Math.round((row.changePct + event.deltaPct * 0.08) * 10) / 10;
      setRows(Array.from(rowsRef.current.values()));
      setTickCount((t) => t + 1);
    });
    return unsub;
  }, [initial, subscribe]);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-xs">
          <thead>
            <tr className="border-b border-border">
              {["Route", "90-day base", "Live fare", "7D", "Pressure", "Trend"].map((h) => (
                <th key={h} className="label-xs whitespace-nowrap px-3 py-2 font-medium first:pl-0">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const Trend = r.lastDelta > 0.03 ? ArrowUpRight : r.lastDelta < -0.03 ? ArrowDownRight : Minus;
              return (
                <tr key={r.routeId} className="border-b border-border/50 transition-colors hover:bg-muted/40">
                  <td className="px-3 py-2.5 pl-0">
                    <Link href={`/routes?id=${r.routeId}`} className="group block">
                      <span className="flex items-center gap-1.5 text-xs font-semibold num">
                        {r.originCode} → {r.destinationCode}
                      </span>
                      <span className="block truncate text-[10px] text-muted-foreground">
                        {r.originCity} → {r.destinationCity} · {r.flights.join(" · ")}
                      </span>
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-3 text-muted-foreground num">{formatINR(r.base)}</td>
                  <td className="whitespace-nowrap px-3 font-semibold num">
                    <AnimatedNumber value={r.current} format={(v) => formatINR(Math.round(v))} />
                  </td>
                  <td className="whitespace-nowrap px-3">
                    <span className={cn("font-semibold num", r.changePct > 0 ? "text-danger" : r.changePct < 0 ? "text-success" : "text-muted-foreground")}>
                      {formatPct(r.changePct)}
                    </span>
                  </td>
                  <td className="px-3">
                    <StatusBadge level={r.pressureLevel} size="sm" />
                  </td>
                  <td className="px-3">
                    <Trend
                      className={cn(
                        "h-3.5 w-3.5",
                        r.lastDelta > 0.03 ? "text-danger" : r.lastDelta < -0.03 ? "text-success" : "text-muted-foreground"
                      )}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        Streaming {ROUTES.length} monitored sectors · {tickCount.toLocaleString("en-IN")} live repricing events this session ·
        sorted by volatility
      </p>
    </div>
  );
}
