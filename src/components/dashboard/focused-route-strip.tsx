"use client";

import Link from "next/link";
import { ArrowRight, Plane } from "lucide-react";
import type { RouteInsight } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { TrendPill } from "@/components/ui/trend-pill";
import { Term } from "@/components/ui/term";
import { formatINR, formatIndex } from "@/lib/format";

/**
 * Appears on Overview when a route is picked in the topbar selector —
 * the global control immediately re-points every surface at that sector.
 */
export function FocusedRouteStrip({ route }: { route: RouteInsight }) {
  const cheapest = [...route.flights].sort((a, b) => a.bestFare - b.bestFare)[0];
  return (
    <div className="panel-glow relative flex flex-wrap items-center gap-x-6 gap-y-3 overflow-hidden rounded-lg border border-primary/30 bg-card px-4 py-3 shadow-panel">
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(60% 140% at 0% 50%, rgba(37,99,235,0.10), transparent 60%)" }} />

      <div className="relative min-w-0">
        <p className="label-xs mb-0.5">Focused sector · from global filter</p>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold leading-none tracking-tight num">
            {route.originCode} → {route.destinationCode}
          </span>
          <StatusBadge level={route.pressureLevel} size="sm" />
        </div>
        <p className="mt-1 truncate text-[10px] text-muted-foreground">
          {route.originCity} → {route.destinationCity}
        </p>
      </div>

      <div className="relative flex flex-wrap items-center gap-x-6 gap-y-2">
        <div>
          <p className="label-xs">Median fare</p>
          <p className="text-lg font-semibold leading-tight num">{formatINR(route.currentFare)}</p>
        </div>
        <div>
          <p className="label-xs">7-day</p>
          <TrendPill value={route.change7dPct} />
        </div>
        <div>
          <p className="label-xs">Route index</p>
          <p className="text-sm font-semibold leading-tight num">{formatIndex(route.indexValue)}</p>
        </div>
        {cheapest ? (
          <div className="min-w-0">
            <p className="label-xs">
              <Term t="flight-number">Cheapest today</Term>
            </p>
            <p className="flex items-center gap-1.5 text-sm font-semibold leading-tight num">
              <Plane className="h-3.5 w-3.5 text-accent" />
              {cheapest.flightNo}
              <span className="font-normal text-muted-foreground">· {formatINR(cheapest.bestFare)} on {cheapest.bestSource}</span>
            </p>
          </div>
        ) : null}
      </div>

      <Link
        href={`/routes?id=${route.id}`}
        className="relative ml-auto inline-flex items-center gap-1 rounded-md border border-border bg-background/60 px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary/50 hover:text-primary"
      >
        Open full analysis <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
