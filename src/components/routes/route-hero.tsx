"use client";

import { ArrowRight, Gauge, TrendingUp } from "lucide-react";
import type { RouteInsight } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { TrendPill } from "@/components/ui/trend-pill";
import { Metric } from "@/components/ui/metric";
import { Term } from "@/components/ui/term";
import { formatINR, formatIndex, formatNumber } from "@/lib/format";

/** Hero block for a selected route — WHAT/WHERE at a glance. */
export function RouteHero({ route }: { route: RouteInsight }) {
  return (
    <div className="panel-glow relative overflow-hidden rounded-lg border border-border bg-card p-5 shadow-panel">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(90% 120% at 0% 0%, rgba(37,99,235,0.08), transparent 55%)" }}
      />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="label-xs mb-1.5">Sector under analysis</p>
          <div className="flex items-center gap-2.5">
            <span className="text-[26px] font-bold leading-none tracking-tight num">{route.originCode}</span>
            <ArrowRight className="h-5 w-5 text-primary" strokeWidth={2.25} />
            <span className="text-[26px] font-bold leading-none tracking-tight num">{route.destinationCode}</span>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {route.originCity} {"→"} {route.destinationCity} &middot; {formatNumber(route.distanceKm)} km
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge level={route.pressureLevel} labelOverride={`${route.pressureLevel.toUpperCase()} PRICE PRESSURE`} />
            <span className="inline-flex items-center gap-1 rounded border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-warning">
              <TrendingUp className="h-3 w-3" /> Forecast: {route.forecastSignal}
            </span>
          </div>
        </div>

        <div className="text-right">
          <p className="label-xs mb-1">Current median fare</p>
          <p className="text-[34px] font-semibold leading-none tracking-tight num">{formatINR(route.currentFare)}</p>
          <div className="mt-2 flex items-center justify-end gap-2">
            <TrendPill value={route.change7dPct} suffix="7d" />
            <TrendPill value={route.change30dPct} suffix="30d" />
          </div>
          <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
            <Gauge className="h-3 w-3" /> Route index {formatIndex(route.indexValue)}
          </div>
        </div>
      </div>

      <div className="relative mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-border pt-4 sm:grid-cols-4">
        <Metric label="90-day average" value={formatINR(route.avgFare90d)} />
        <Metric label="90-day low" value={formatINR(route.lowestFare90d)} valueClassName="text-success" />
        <Metric label="90-day high" value={formatINR(route.highestFare90d)} valueClassName="text-danger" />
        <Metric label="Booking velocity" value={`+${route.bookingVelocityPct.toFixed(0)}%`} hint="vs 30-day baseline" info="booking-velocity" />
      </div>

      {route.flights.length > 0 && (
        <div className="relative mt-4 border-t border-border pt-3">
          <p className="label-xs mb-2">
            <Term t="flight-number">Today&apos;s cheapest non-stops</Term> · best of 5 sources · full board below
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {[...route.flights]
              .sort((a, b) => a.bestFare - b.bestFare)
              .slice(0, 3)
              .map((f, i) => (
                <div
                  key={f.flightNo}
                  className={`rounded-md border px-3 py-2 ${i === 0 ? "border-primary/35 bg-primary/[0.06]" : "border-border bg-background/40"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold tracking-tight num">{f.flightNo}</span>
                    <span className={`text-xs font-semibold num ${i === 0 ? "text-success" : ""}`}>{formatINR(f.bestFare)}</span>
                  </div>
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                    {f.airline} · {f.aircraft}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground num">
                    {f.depTime} → {f.arrTime} IST · {f.durationLabel}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
