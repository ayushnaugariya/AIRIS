"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { RouteHero } from "@/components/routes/route-hero";
import { FareTrendChart } from "@/components/routes/fare-trend-chart";
import { BookingWindowChart } from "@/components/routes/booking-window-chart";
import { FareComposition } from "@/components/routes/fare-composition";
import { ComparableFareTable } from "@/components/routes/comparable-fare-table";
import { FareSurface } from "@/components/routes/fare-surface";
import { FlightBoard } from "@/components/routes/flight-board";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { StatusBadge } from "@/components/ui/status-badge";
import { TrendPill } from "@/components/ui/trend-pill";
import { Input } from "@/components/ui/input";
import { useApiData } from "@/hooks/use-api-data";
import { useFilters } from "@/components/providers/filters-provider";
import { airisApi } from "@/lib/api";
import { ROUTES } from "@/lib/mock/routes-data";
import { formatINR, formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";

function RoutesInner() {
  const router = useRouter();
  const params = useSearchParams();
  const filters = useFilters();

  const paramId = params.get("id");
  const activeRouteId = (filters.routeId && filters.routeId !== "all") ? filters.routeId : (paramId || "DEL-BOM");
  const [query, setQuery] = useState("");

  // Sync URL query on mount if param provided
  useEffect(() => {
    if (paramId && paramId !== filters.routeId) {
      filters.setRouteId(paramId);
    }
  }, [paramId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (id: string) => {
    filters.setRouteId(id);
    router.replace(`/routes?id=${encodeURIComponent(id)}`, { scroll: false });
  };

  const insight = useApiData(() => airisApi.routes.get(activeRouteId), [activeRouteId]);
  const trend = useApiData(() => airisApi.routes.getFareTrend(activeRouteId), [activeRouteId]);
  const booking = useApiData(() => airisApi.routes.getBookingWindow(activeRouteId), [activeRouteId]);
  const composition = useApiData(() => airisApi.routes.getFareComposition(activeRouteId), [activeRouteId]);
  const comparables = useApiData(() => airisApi.routes.getComparableFares(activeRouteId), [activeRouteId]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ROUTES.slice(0, 6);
    return ROUTES.filter(
      (r) =>
        r.id.toLowerCase().includes(q.replace(/\s+/g, "-")) ||
        `${r.originCity} ${r.destinationCity}`.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Route Intelligence"
        title="Sector-level fare analysis"
        subtitle="Every trunk sector decomposed into fare structure, booking-window behaviour and product-adjusted comparisons."
      />

      {/* Search + selector row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <label htmlFor="route-search" className="label-xs mb-1.5 block">Search a sector</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="route-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Delhi → Mumbai or DEL-BOM"
                className="h-9 pl-8 text-sm"
              />
            </div>
            <ul className="mt-2 max-h-[168px] divide-y divide-border/60 overflow-y-auto" role="listbox" aria-label="Route results">
              {results.map((r) => (
                <li key={r.id}>
                  <button
                    onClick={() => handleSelect(r.id)}
                    aria-selected={r.id === activeRouteId}
                    role="option"
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-muted/60",
                      r.id === activeRouteId && "bg-primary/[0.08]"
                    )}
                  >
                    <span className="text-xs font-semibold num">{`${r.originCode} → ${r.destinationCode}`}</span>
                    <span className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground num">{formatINR(r.currentFare)}</span>
                      <TrendPill value={r.change7dPct} size="xs" />
                    </span>
                  </button>
                </li>
              ))}
              {!results.length && <li className="px-2 py-4 text-center text-xs text-muted-foreground">No sectors match &ldquo;{query}&rdquo;</li>}
            </ul>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          {insight.loading && !insight.data ? (
            <LoadingState variant="chart" />
          ) : insight.error ? (
            <ErrorState message={insight.error} onRetry={insight.refresh} />
          ) : insight.data ? (
            <RouteHero route={insight.data} />
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <SectionHeader title="Fare trend · last 45 days" info="moving-average" subtitle="Median observed fare with moving average and observed band" className="p-4 pb-0" />
          <CardContent className="pt-2">
            {trend.loading && !trend.data ? (
              <LoadingState variant="chart" />
            ) : trend.error ? (
              <ErrorState message={trend.error} onRetry={trend.refresh} />
            ) : trend.data ? (
              <FareTrendChart data={trend.data} />
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <SectionHeader title="Booking-window analysis" info="booking-window" subtitle="Same sector, different advance-purchase bands" className="p-4 pb-0" />
          <CardContent className="pt-2">
            {booking.loading && !booking.data ? (
              <LoadingState variant="chart" />
            ) : booking.error ? (
              <ErrorState message={booking.error} onRetry={booking.refresh} />
            ) : booking.data ? (
              <BookingWindowChart data={booking.data} />
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <SectionHeader title="Fare composition" subtitle={`Standard Economy · ${insight.data ? formatINR(insight.data.currentFare) : ""}`} className="p-4 pb-0" />
          <CardContent className="pt-3">
            {composition.loading && !composition.data ? (
              <LoadingState variant="rows" rows={5} />
            ) : composition.error ? (
              <ErrorState message={composition.error} onRetry={composition.refresh} />
            ) : composition.data ? (
              <FareComposition components={composition.data} />
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <SectionHeader title="Fare surface" subtitle="Median fare by booking window × departure day (Plotly)" className="p-4 pb-0" />
          <CardContent className="pt-2">
            {insight.data ? <FareSurface baseFare={insight.data.currentFare} /> : <LoadingState variant="chart" />}
          </CardContent>
        </Card>

        <Card>
          <SectionHeader title="Pressure position" info="pressure-score" subtitle={`${insight.data ? `${insight.data.originCode} → ${insight.data.destinationCode}` : ""} against the network`} className="p-4 pb-0" />
          <CardContent className="pt-3 space-y-3">
            {insight.data ? (
              <>
                <div className="flex items-center justify-between rounded-md border border-border bg-background/50 px-3 py-2.5">
                  <span className="text-xs text-muted-foreground">Composite pressure</span>
                  <span className="text-lg font-bold leading-none num">{insight.data.pressureScore}<span className="text-xs font-normal text-muted-foreground">/100</span></span>
                </div>
                <StatusBadge level={insight.data.pressureLevel} labelOverride={`${insight.data.pressureLevel.toUpperCase()} PRESSURE`} />
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Score blends recent movement ({formatPct(insight.data.change7dPct)}), deviation from the 90-day mean,
                  booking velocity (+{insight.data.bookingVelocityPct.toFixed(0)}%) and live anomaly signals.
                </p>
                <div className="grid grid-cols-2 gap-3 border-t border-border pt-3 text-xs">
                  <div>
                    <p className="label-xs">30-day change</p>
                    <TrendPill value={insight.data.change30dPct} />
                  </div>
                  <div>
                    <p className="label-xs">Forecast signal</p>
                    <p className="font-semibold capitalize">{insight.data.forecastSignal}</p>
                  </div>
                </div>
              </>
            ) : (
              <LoadingState variant="rows" rows={3} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full flight board with per-website prices */}
      <Card>
        <SectionHeader
          title="Flight board · every non-stop, every website"
          info="flight-number"
          subtitle={`${insight.data ? `${insight.data.originCity} → ${insight.data.destinationCity}` : ""} · 10 scheduled services × 5 captured sources`}
          className="p-4 pb-1"
        />
        <CardContent className="pt-1">
          {insight.data ? (
            <FlightBoard flights={insight.data.flights} />
          ) : (
            <LoadingState variant="rows" rows={6} />
          )}
        </CardContent>
      </Card>

      <Card>
        <SectionHeader title="Comparable fare analysis" info="comparable-fares" subtitle="Products observed on this sector — and why the index does not treat them as equal" className="p-4 pb-0" />
        <CardContent className="pt-2">
          {comparables.loading && !comparables.data ? (
            <LoadingState variant="rows" />
          ) : comparables.error ? (
            <ErrorState message={comparables.error} onRetry={comparables.refresh} />
          ) : comparables.data ? (
            <ComparableFareTable fares={comparables.data} />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export default function RouteIntelligencePage() {
  return (
    <Suspense fallback={<LoadingState variant="chart" />}>
      <RoutesInner />
    </Suspense>
  );
}
