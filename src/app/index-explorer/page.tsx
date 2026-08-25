"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { IndexChart } from "@/components/dashboard/index-chart";
import { RegionalIndexPanel } from "@/components/dashboard/regional-index-panel";
import { AirlineIndexPanel } from "@/components/dashboard/airline-index-panel";
import { RegionComparisonChart } from "@/components/dashboard/region-comparison-chart";
import { Metric } from "@/components/ui/metric";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { useApiData } from "@/hooks/use-api-data";
import { useFilters } from "@/components/providers/filters-provider";
import { airisApi } from "@/lib/api";

export default function IndexExplorerPage() {
  const series = useApiData(() => airisApi.indices.getSeries("explorer"), []);
  const regional = useApiData(() => airisApi.indices.getRegional(), []);
  const airlines = useApiData(() => airisApi.indices.getAirlines(), []);
  const stats = useApiData(() => airisApi.indices.getMarketStats(), []);
  const filters = useFilters();

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Index Explorer"
        title="India Airfare Price Index"
        subtitle="The full national series behind every headline number — history, seasonal structure, regional divergence and macro correlations."
      />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-4" aria-label="Market statistics">
        {stats.data
          ? stats.data.map((s) => (
              <Card key={s.label} className="p-4">
                <Metric
                  label={s.label}
                  info={s.label === "ATF correlation" ? "atf-correlation" : s.label === "Load factor" ? "load-factor" : s.label === "Capacity ASK YoY" ? "ask" : "elasticity"}
                  value={<span className="text-xl">{s.value}</span>}
                  hint={s.detail}
                />
              </Card>
            ))
          : Array.from({ length: 4 }).map((_, i) => <LoadingState key={i} variant="cards" rows={0} />)}
      </section>

      <Card>
        <SectionHeader title="National index · 90 days + forecast" info="index" subtitle="Actual vs moving average vs previous period, with event annotations" className="p-4 pb-0" />
        <CardContent className="pt-2">
          {series.loading && !series.data ? (
            <LoadingState variant="chart" />
          ) : series.error ? (
            <ErrorState message={series.error} onRetry={series.refresh} />
          ) : series.data ? (
            <IndexChart series={series.data} height={380} />
          ) : null}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <SectionHeader title="Regional convergence" info="regional-index" subtitle="Seven-day index trajectory by zone · use the region filter to emphasize" className="p-4 pb-0" />
          <CardContent className="pt-2">
            {regional.loading && !regional.data ? (
              <LoadingState variant="chart" />
            ) : regional.error ? (
              <ErrorState message={regional.error} onRetry={regional.refresh} />
            ) : regional.data ? (
              <RegionComparisonChart regions={regional.data} highlight={filters.region} />
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <SectionHeader title="Regional snapshot" info="regional-index" subtitle="Index, change, pressure" className="p-4 pb-0" />
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
      </div>

      <Card>
        <SectionHeader title="Airline contribution" info="airline-index" subtitle="Carrier indices within the national aggregate · use the airline filter to emphasize" className="p-4 pb-0" />
        <CardContent className="pt-2">
          {airlines.loading && !airlines.data ? (
            <LoadingState variant="rows" />
          ) : airlines.error ? (
            <ErrorState message={airlines.error} onRetry={airlines.refresh} />
          ) : airlines.data ? (
            <AirlineIndexPanel data={airlines.data} highlight={filters.airline} />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
