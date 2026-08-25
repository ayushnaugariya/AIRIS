"use client";

import { AlertOctagon, ArrowUpRight, Gauge, Radar, Route as RouteIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { KPICard } from "@/components/dashboard/kpi-card";
import { IndexChart } from "@/components/dashboard/index-chart";
import { IndexStatsStrip } from "@/components/dashboard/index-stats-strip";
import { Trend60D } from "@/components/dashboard/trend-60d";
import { LiveRouteFeed } from "@/components/dashboard/live-route-feed";
import { AiAnomalyCards } from "@/components/dashboard/ai-anomaly-cards";
import { RegionalIndexPanel } from "@/components/dashboard/regional-index-panel";
import { AirlineIndexPanel } from "@/components/dashboard/airline-index-panel";
import { PricePressurePanel } from "@/components/dashboard/price-pressure-panel";
import { LiveStatusPanel } from "@/components/dashboard/live-status-panel";
import { RouteMapSection } from "@/components/dashboard/route-map-section";
import { FocusedRouteStrip } from "@/components/dashboard/focused-route-strip";
import { useApiData } from "@/hooks/use-api-data";
import { airisApi } from "@/lib/api";
import { useLive } from "@/components/providers/live-provider";
import { useFilters } from "@/components/providers/filters-provider";
import { ErrorState, LoadingState } from "@/components/ui/states";
import type { RouteInsight } from "@/types";

export default function OverviewPage() {
  const summary = useApiData(() => airisApi.indices.getSummary(), []);
  const series = useApiData(() => airisApi.indices.getSeries("national"), []);
  const regional = useApiData(() => airisApi.indices.getRegional(), []);
  const airlines = useApiData(() => airisApi.indices.getAirlines(), []);
  const pressure = useApiData(() => airisApi.routes.getPricePressure(), []);
  const anomalies = useApiData(() => airisApi.anomalies.list(), []);
  const { indexValue } = useLive();
  const filters = useFilters();

  const focusRouteId = filters.routeId === "all" ? null : filters.routeId;
  const focusedRoute = useApiData<RouteInsight | null>(
    () => (focusRouteId ? airisApi.routes.get(focusRouteId) : Promise.resolve(null)),
    [focusRouteId]
  );

  const s = summary.data;
  const liveChangePct = s ? ((indexValue - s.previousPeriodIndex) / s.previousPeriodIndex) * 100 : 0;

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Smart India Hackathon 2026 · SIH26056 · CPI Augmentation"
        title="India Airfare Intelligence"
        subtitle="The near-real-time airfare market signal — scraped from airline and OTA portals, normalized, and monitored around the clock."
      />

      {/* KPI row */}
      <section aria-label="Key indicators">
        {!s ? (
          <LoadingState variant="cards" />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <KPICard
              label="National Airfare Index"
              info="index"
              value={indexValue}
              trend={{ value: liveChangePct }}
              footnote="vs previous period · updates live"
              stats={[
                { label: "Current", value: indexValue.toFixed(1) },
                { label: "Prev.", value: s.previousPeriodIndex.toFixed(1) },
                { label: "YoY", value: `+${s.yoyPct}%` },
              ]}
              icon={Gauge}
              tone="primary"
              spark={[121.4, 122.2, 123.1, 122.8, 124.0, 125.3, 126.1, 127.0, 127.8]}
              href="/index-explorer"
            />
            <KPICard
              label="Price Pressure"
              info="pressure"
              displayValue={s.pressureLevel.toUpperCase()}
              trend={{ value: s.pressureChangePct, invert: true }}
              footnote="Composite of movement, velocity & anomalies"
              icon={Radar}
              tone="warning"
              spark={[62, 64, 66, 69, 71, 74, 78, 81, 84]}
            />
            <KPICard
              label="Routes Monitored"
              info="routes-monitored"
              value={s.routesMonitored}
              decimals={0}
              footnote={`+${s.newRoutesThisWeek} routes onboarded this week`}
              icon={RouteIcon}
              tone="accent"
              href="/routes"
            />
            <KPICard
              label="Anomalies Detected"
              info="anomaly"
              value={s.anomaliesDetected}
              decimals={0}
              footnote={`${s.anomaliesCritical} critical require review`}
              icon={AlertOctagon}
              tone="danger"
              spark={[12, 14, 18, 17, 22, 26, 29, 33, 37]}
              href="/anomalies"
            />
            <KPICard
              label="Forecast Signal"
              info="forecast-signal"
              displayValue={s.forecastSignal.toUpperCase()}
              footnote={`${s.forecastHorizonLabel} · confidence 84%`}
              icon={ArrowUpRight}
              tone="success"
              spark={[126.9, 127.4, 128.1, 128.6, 129.4, 130.2, 131.1, 131.6]}
              href="/forecasts"
            />
          </div>
        )}
      </section>

      {/* Hero chart + system/AI rail */}
      <section className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3" aria-label="National index chart">
        <Card className="xl:col-span-2">
          <SectionHeader
            title="India Airfare Price Index"
            info="index"
            subtitle="National index · last 90 days with 14-day forecast"
            actions={
              <span className="hidden items-center gap-1 rounded border border-border bg-muted/60 px-2 py-1 text-[10px] font-medium text-muted-foreground sm:inline-flex">
                Live · {indexValue.toFixed(1)}
              </span>
            }
            className="p-4 pb-0"
          />
          <CardContent className="pt-2">
            {series.loading && !series.data ? (
              <LoadingState variant="chart" />
            ) : series.error ? (
              <ErrorState message={series.error} onRetry={series.refresh} />
            ) : series.data ? (
              <div className="space-y-4">
                <IndexChart series={series.data} height={310} />
                <IndexStatsStrip series={series.data} />
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <SectionHeader title="System Status" subtitle="Pipeline health · live heartbeat" className="p-4 pb-0" />
            <CardContent className="pt-2">
              <LiveStatusPanel />
            </CardContent>
          </Card>
          <Card className="flex-1">
            <SectionHeader title="AI Anomaly Detect" info="anomaly" subtitle="Top detections with model attribution" className="p-4 pb-1" />
            <CardContent className="pt-0">
              {anomalies.loading && !anomalies.data ? (
                <LoadingState variant="rows" rows={3} />
              ) : anomalies.error ? (
                <ErrorState message={anomalies.error} onRetry={anomalies.refresh} />
              ) : anomalies.data ? (
                <AiAnomalyCards anomalies={anomalies.data} />
              ) : null}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 60-day trend + pressure ranking */}
      <section className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <SectionHeader title="60-Day Airfare Index Trend" info="regional-index" subtitle="National composite vs regional sub-indices · base 2024 = 100" className="p-4 pb-0" />
          <CardContent className="pt-2">
            <Trend60D />
          </CardContent>
        </Card>
        <Card>
          <SectionHeader title="Route-Level Price Pressure" info="pressure-score" subtitle="Early-warning ranking" className="p-4 pb-0" />
          <CardContent className="pt-1">
            {pressure.loading && !pressure.data ? (
              <LoadingState variant="rows" rows={5} />
            ) : pressure.error ? (
              <ErrorState message={pressure.error} onRetry={pressure.refresh} />
            ) : pressure.data ? (
              <PricePressurePanel entries={pressure.data} limit={6} />
            ) : null}
          </CardContent>
        </Card>
      </section>

      {/* Focused route + map */}
      <section aria-label="Route pressure map">
        {focusedRoute.data ? (
          <div className="mb-4">
            <FocusedRouteStrip route={focusedRoute.data} />
          </div>
        ) : null}
        <Card>
          <SectionHeader
            title="Route Intelligence Map"
            subtitle="Arc intensity tracks sector-level price pressure · hover for live fares · open the full India Map from the sidebar"
            className="p-4 pb-3"
          />
          <CardContent className="p-4 pt-0 lg:p-4 lg:pt-0">
            <RouteMapSection focusRouteId={focusRouteId} />
          </CardContent>
        </Card>
      </section>

      {/* Live route feed */}
      <section>
        <Card>
          <SectionHeader
            title="Live Route Intelligence Feed"
            subtitle="Sectors repricing in near-real-time · fares stream over WebSocket"
            info="fare-observation"
            className="p-4 pb-1"
          />
          <CardContent className="pt-1">
            <LiveRouteFeed />
          </CardContent>
        </Card>
      </section>

      {/* Breakdown grid */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2" aria-label="Index breakdowns">
        <Card>
          <SectionHeader title="Regional Index" info="regional-index" subtitle="Six-zone breakdown · use the region filter to emphasize" className="p-4 pb-0" />
          <CardContent className="pt-1">
            {regional.loading && !regional.data ? (
              <LoadingState variant="rows" />
            ) : regional.error ? (
              <ErrorState message={regional.error} onRetry={regional.refresh} />
            ) : regional.data ? (
              <RegionalIndexPanel data={regional.data} highlight={filters.region} />
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <SectionHeader title="Airline Index" info="airline-index" subtitle="Carrier pricing vs market share · use the airline filter" className="p-4 pb-0" />
          <CardContent className="pt-1">
            {airlines.loading && !airlines.data ? (
              <LoadingState variant="rows" />
            ) : airlines.error ? (
              <ErrorState message={airlines.error} onRetry={airlines.refresh} />
            ) : airlines.data ? (
              <AirlineIndexPanel data={airlines.data} highlight={filters.airline} />
            ) : null}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
