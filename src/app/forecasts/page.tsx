"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ForecastChart, type ForecastScenario } from "@/components/forecasts/forecast-chart";
import { ForecastSummaryCards } from "@/components/forecasts/forecast-summary-cards";
import { RisingRoutesList } from "@/components/forecasts/rising-routes";
import { ConfidenceDistributionPanel } from "@/components/forecasts/confidence-distribution";
import { ConfidenceMeter } from "@/components/forecasts/confidence-meter";
import { AccuracyPanel } from "@/components/forecasts/accuracy-panel";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { Term } from "@/components/ui/term";
import { useApiData } from "@/hooks/use-api-data";
import { airisApi } from "@/lib/api";
import type { ForecastHorizon } from "@/types";
import { cn } from "@/lib/utils";

const SCENARIO_OPTIONS: { key: ForecastScenario; label: string }[] = [
  { key: "base", label: "Base" },
  { key: "fuel", label: "Fuel shock" },
  { key: "capacity", label: "Capacity cut" },
  { key: "demand", label: "Demand slump" },
];

export default function ForecastsPage() {
  const [horizon, setHorizon] = useState<ForecastHorizon>(7);
  const [scenario, setScenario] = useState<ForecastScenario>("base");
  const summary = useApiData(() => airisApi.forecasts.getSummary(horizon), [horizon]);
  const routes = useApiData(() => airisApi.forecasts.getRouteForecasts(), []);
  const confidence = useApiData(() => airisApi.forecasts.getConfidenceDistribution(), []);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={`airis-fx 2.4.1 · retrained nightly`}
        title="Airfare Forecast"
        subtitle="Probabilistic outlook for the national index and the routes most likely to move — with explicit confidence, never a bare number."
        actions={
          <Tabs value={String(horizon)} onValueChange={(v) => setHorizon(Number(v) as ForecastHorizon)}>
            <TabsList aria-label="Forecast horizon">
              <TabsTrigger value="7">7-Day</TabsTrigger>
              <TabsTrigger value="14">14-Day</TabsTrigger>
              <TabsTrigger value="30">30-Day</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      {summary.loading && !summary.data ? (
        <LoadingState variant="cards" />
      ) : summary.error ? (
        <ErrorState message={summary.error} onRetry={summary.refresh} />
      ) : summary.data ? (
        <ForecastSummaryCards summary={summary.data} />
      ) : null}

      <Card>
        <SectionHeader
          title={`National index outlook · ${horizon} days`}
          info="confidence-interval"
          subtitle="Historical observed values vs forecast path with 80% confidence interval · stress the outlook with a scenario"
          className="p-4 pb-0"
          actions={
            <div className="inline-flex flex-wrap rounded-md bg-muted p-0.5" role="group" aria-label="Forecast scenario">
              {SCENARIO_OPTIONS.map((o) => (
                <button
                  key={o.key}
                  onClick={() => setScenario(o.key)}
                  aria-pressed={scenario === o.key}
                  className={cn(
                    "rounded-sm px-2.5 py-1 text-[11px] font-medium transition-colors",
                    scenario === o.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Term t="scenario">{o.label}</Term>
                </button>
              ))}
            </div>
          }
        />
        <CardContent className="pt-2">
          <ForecastChart horizon={horizon} scenario={scenario} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <SectionHeader title="Model accuracy" info="backtest" subtitle="Published transparently, re-scored daily" className="p-4 pb-1" />
          <CardContent className="pt-0">
            <AccuracyPanel />
          </CardContent>
        </Card>

        <Card>
          <SectionHeader title="Routes expected to rise" info="forecast-signal" subtitle="Ranked by projected 7-day movement" className="p-4 pb-0" />
          <CardContent className="pt-1">
            {routes.loading && !routes.data ? (
              <LoadingState variant="rows" />
            ) : routes.error ? (
              <ErrorState message={routes.error} onRetry={routes.refresh} />
            ) : routes.data ? (
              <>
                <RisingRoutesList routes={routes.data.slice(0, 4)} />
                <div className="mt-2 border-t border-border pt-1">
                  <RisingRoutesList routes={routes.data.slice(4)} />
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <SectionHeader title="Forecast confidence" info="confidence" subtitle="Route coverage by reliability tier" className="p-4 pb-0" />
          <CardContent className="pt-3">
            {confidence.loading && !confidence.data ? (
              <LoadingState variant="rows" rows={3} />
            ) : confidence.error ? (
              <ErrorState message={confidence.error} onRetry={confidence.refresh} />
            ) : confidence.data ? (
              <ConfidenceDistributionPanel data={confidence.data} />
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <SectionHeader title="Model diagnostics" info="confidence" subtitle="Current run quality signals" className="p-4 pb-0" />
          <CardContent className="space-y-4 pt-3">
            <ConfidenceMeter value={84} label="National index (7-day)" />
            <ConfidenceMeter value={76} label="Trunk-route ensemble" compact />
            <ConfidenceMeter value={68} label="Leisure / event sectors" compact />
            <p className="rounded-md border border-border bg-background/50 p-2.5 text-[10px] leading-relaxed text-muted-foreground">
              Confidence degrades when booking velocity diverges from historical patterns or capacity announcements are pending.
              Low-confidence forecasts are excluded from CPI briefing material by policy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
