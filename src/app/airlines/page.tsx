"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { AirlineTable } from "@/components/airlines/airline-table";
import { AirlineScatter } from "@/components/airlines/airline-scatter";
import { AirlineIndexPanel } from "@/components/dashboard/airline-index-panel";
import { FareLadder } from "@/components/airlines/fare-ladder";
import { Metric } from "@/components/ui/metric";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { useApiData } from "@/hooks/use-api-data";
import { useFilters } from "@/components/providers/filters-provider";
import { airisApi } from "@/lib/api";

export default function AirlinesPage() {
  const airlines = useApiData(() => airisApi.indices.getAirlines(), []);
  const filters = useFilters();
  const data = airlines.data;

  const leader = data?.[0];
  const cheapest = data ? [...data].sort((a, b) => a.index - b.index)[0] : undefined;
  const mostPunctual = data ? [...data].sort((a, b) => b.onTimePct - a.onTimePct)[0] : undefined;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Carrier pricing power & service reliability"
        title="Airline Intelligence"
        subtitle="Who is driving the national index? Carrier-level pricing, market share and on-time performance in one comparable view."
      />

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Carrier highlights">
        {!data ? (
          <>
            <LoadingState variant="cards" rows={1} />
            <LoadingState variant="cards" rows={1} />
            <LoadingState variant="cards" rows={1} />
          </>
        ) : (
          <>
            <Card className="p-4">
              <Metric label="Index leader (highest)" value={leader ? `${leader.name} · ${leader.index.toFixed(1)}` : "—"} hint="Pricing above network average" valueClassName="text-base" />
            </Card>
            <Card className="p-4">
              <Metric label="Value leader (lowest)" value={cheapest ? `${cheapest.name} · ${cheapest.index.toFixed(1)}` : "—"} hint="Dampening the national index" valueClassName="text-base text-success" />
            </Card>
            <Card className="p-4">
              <Metric label="Most punctual" value={mostPunctual ? `${mostPunctual.name} · ${mostPunctual.onTimePct}%` : "—"} hint="On-time departures, trailing 30d" valueClassName="text-base" />
            </Card>
          </>
        )}
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <SectionHeader title="Carrier comparison" subtitle="Share, index trajectory, punctuality and pressure · dimmed rows are filtered out" className="p-4 pb-2" />
          <CardContent className="pt-0">
            {airlines.loading && !data ? (
              <LoadingState variant="rows" rows={6} />
            ) : airlines.error ? (
              <ErrorState message={airlines.error} onRetry={airlines.refresh} />
            ) : data ? (
              <div className={filters.airline !== "all" ? "[&_tbody_tr]:opacity-100" : ""}>
                <AirlineTable data={data} highlight={filters.airline} />
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <SectionHeader title="Service vs price positioning" subtitle="Bubble area = market share" className="p-4 pb-0" />
          <CardContent className="pt-2">
            {airlines.loading && !data ? (
              <LoadingState variant="chart" />
            ) : airlines.error ? (
              <ErrorState message={airlines.error} onRetry={airlines.refresh} />
            ) : data ? (
              <AirlineScatter data={data} />
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <SectionHeader title="Carrier fare ladder" info="fare-ladder" subtitle="Median trunk-route one-way economy fare" className="p-4 pb-1" />
          <CardContent className="pt-0">
            {data ? (
              <FareLadder airlines={data} />
            ) : (
              <LoadingState variant="rows" rows={5} />
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <SectionHeader title="Index contribution" info="airline-index" subtitle="How each carrier's pricing moves the national aggregate" className="p-4 pb-0" />
          <CardContent className="pt-2">
            {airlines.loading && !data ? (
              <LoadingState variant="rows" />
            ) : airlines.error ? (
              <ErrorState message={airlines.error} onRetry={airlines.refresh} />
            ) : data ? (
              <AirlineIndexPanel data={data} highlight={filters.airline} />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
