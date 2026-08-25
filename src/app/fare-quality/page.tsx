"use client";

import { useEffect, useMemo } from "react";
import { ShieldX, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { QualityScoreRing } from "@/components/fares/quality-score-ring";
import { QualityDimensions } from "@/components/fares/quality-dimensions";
import { FareComparisonTable } from "@/components/fares/fare-comparison-table";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { Metric } from "@/components/ui/metric";
import { Term } from "@/components/ui/term";
import { StatusBadge } from "@/components/ui/status-badge";
import { useApiData } from "@/hooks/use-api-data";
import { useFilters } from "@/components/providers/filters-provider";
import { airisApi } from "@/lib/api";
import { formatINR, formatPct } from "@/lib/format";

export default function FareQualityPage() {
  const filters = useFilters();
  const routeId = filters.routeId === "all" ? "DEL-BOM" : filters.routeId;

  // Keep the global selector authoritative; default to DEL-BOM.
  useEffect(() => {
    if (filters.routeId === "all") filters.setRouteId("DEL-BOM");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const score = useApiData(() => airisApi.fares.getQualityScore(routeId), [routeId]);
  const observations = useApiData(() => airisApi.fares.getObservations(routeId), [routeId]);
  const route = useApiData(() => airisApi.routes.get(routeId), [routeId]);

  const leaderboard = useMemo(() => {
    if (!observations.data) return [];
    const bySource = new Map<string, { total: number; count: number }>();
    observations.data.forEach((o) => {
      const entry = bySource.get(o.source) ?? { total: 0, count: 0 };
      entry.total += o.totalFare === o.normalizedFare ? 96 : 88;
      entry.count += 1;
      bySource.set(o.source, entry);
    });
    return Array.from(bySource.entries())
      .map(([source, v]) => ({ source, quality: Math.round(v.total / v.count), captures: v.count }))
      .sort((a, b) => b.quality - a.quality);
  }, [observations.data]);

  const cheapestFlights = useMemo(
    () => (route.data ? [...route.data.flights].sort((a, b) => a.bestFare - b.bestFare).slice(0, 3) : []),
    [route.data]
  );

  const q = score.data;

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="The engine that keeps the index honest"
        title="Fare Quality Engine"
        subtitle={`Every observation is scored across seven normalization dimensions before it can influence the index. Currently auditing ${routeId.replace("-", " → ")} — change the sector from the topbar to re-audit.`}
      />

      {/* Route context strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {q ? (
          <>
            <Card className="p-4">
              <Metric label="Sector" value={<span className="num">{q.routeId.replace("-", " → ")}</span>} />
            </Card>
            <Card className="p-4">
              <Metric label="Median fare" value={formatINR(q.medianFare)} />
            </Card>
            <Card className="p-4">
              <Metric label="Observations" value={String(q.observationsCount)} hint="last 15 minutes" />
            </Card>
            <Card className="p-4">
              <Metric label="Verified" value={formatPct(q.verifiedPct, { signed: false })} hint="dual-capture confirmed" />
            </Card>
            <Card className="p-4">
              <Metric label="In quarantine" info="quarantine" value={String(q.quarantineCount)} hint="excluded from index" valueClassName="text-warning" />
            </Card>
          </>
        ) : (
          <LoadingState variant="cards" />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Score */}
        <Card>
          <SectionHeader title="Fare Comparability Score" info="comparability-score" subtitle={`Aggregated across today's captures on ${routeId.replace("-", " → ")}`} className="p-4 pb-0" />
          <CardContent className="flex flex-col items-center pt-5">
            {score.loading && !score.data ? (
              <LoadingState variant="chart" />
            ) : score.error ? (
              <ErrorState message={score.error} onRetry={score.refresh} />
            ) : q ? (
              <>
                <QualityScoreRing score={q.score} grade={q.grade} />
                <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
                  Scores below <span className="font-semibold text-foreground">70</span> are quarantined: the observation is
                  excluded from index computation and queued for source verification.
                </p>
              </>
            ) : null}
          </CardContent>
        </Card>

        {/* Dimensions */}
        <Card className="xl:col-span-2">
          <SectionHeader
            title="Normalization dimensions"
            info="normalization"
            subtitle="Every dimension must pass for an observation to be treated as comparable"
            className="p-4 pb-2"
          />
          <CardContent className="pt-0">
            {score.loading && !score.data ? (
              <LoadingState variant="rows" rows={7} />
            ) : score.error ? (
              <ErrorState message={score.error} onRetry={score.refresh} />
            ) : q ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <QualityDimensions dimensions={q.dimensions.slice(0, 4)} />
                <QualityDimensions dimensions={q.dimensions.slice(4)} />
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Observation table */}
      <Card>
        <SectionHeader
          title="Observation-level comparison"
          info="normalized-fare"
          subtitle={`${routeId.replace("-", " → ")} · Economy · identical booking window · captured within the last five minutes`}
          className="p-4 pb-0"
        />
        <CardContent className="pt-1">
          {observations.loading && !observations.data ? (
            <LoadingState variant="rows" rows={6} />
          ) : observations.error ? (
            <ErrorState message={observations.error} onRetry={observations.refresh} />
          ) : observations.data ? (
            <FareComparisonTable observations={observations.data} />
          ) : null}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Cheapest flights on this sector */}
        <Card>
          <SectionHeader
            title="Flights behind these numbers"
            info="flight-number"
            subtitle={`Cheapest non-stops · ${route.data ? `${route.data.originCode} → ${route.data.destinationCode}` : ""}`}
            className="p-4 pb-1"
          />
          <CardContent className="pt-0">
            {cheapestFlights.length ? (
              <ul className="space-y-2">
                {cheapestFlights.map((f, i) => (
                  <li key={f.flightNo} className="flex items-center justify-between gap-3 rounded-md border border-border bg-background/40 px-3 py-2">
                    <span>
                      <span className="block text-xs font-bold num">{f.flightNo}</span>
                      <span className="block text-[10px] text-muted-foreground">
                        {f.airline} · {f.depTime} → {f.arrTime}
                      </span>
                    </span>
                    <span className="text-right">
                      <span className={`block text-xs font-semibold num ${i === 0 ? "text-success" : ""}`}>{formatINR(f.bestFare)}</span>
                      <span className="block text-[9px] text-muted-foreground">{f.bestSource}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <LoadingState variant="rows" rows={3} />
            )}
          </CardContent>
        </Card>

        {/* Source leaderboard */}
        <Card>
          <SectionHeader title="Source reliability" subtitle="Avg quality contribution by website" className="p-4 pb-1" />
          <CardContent className="pt-0">
            {leaderboard.length ? (
              <ul className="space-y-2">
                {leaderboard.slice(0, 6).map((s, i) => (
                  <li key={s.source} className="flex items-center gap-2 text-xs">
                    <span className="w-4 text-[10px] text-muted-foreground num">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate font-medium">{s.source}</span>
                    {i === 0 && <Trophy className="h-3 w-3 text-warning" />}
                    <span className="font-semibold num">{s.quality}</span>
                    <StatusBadge level={s.quality >= 93 ? "low" : s.quality >= 85 ? "moderate" : "elevated"} size="sm" labelOverride={s.quality >= 93 ? "TRUSTED" : s.quality >= 85 ? "OK" : "WATCH"} />
                  </li>
                ))}
              </ul>
            ) : (
              <LoadingState variant="rows" rows={5} />
            )}
          </CardContent>
        </Card>

        {/* Quarantine queue */}
        <Card>
          <SectionHeader title="Quarantine queue" info="quarantine" subtitle="Held out of the index pending verification" className="p-4 pb-1" />
          <CardContent className="pt-0">
            <ul className="space-y-2">
              {[
                { source: "EaseMyTrip", reason: "Refundable product not normalized at capture", score: 64 },
                { source: "Paytm Travel", reason: "Business-cabin fare mixed into economy bucket", score: 58 },
              ].map((r) => (
                <li key={r.source} className="rounded-md border border-warning/25 bg-warning/[0.06] p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold">
                      <ShieldX className="h-3.5 w-3.5 text-warning" />
                      {r.source}
                    </span>
                    <span className="rounded border border-warning/30 bg-warning/10 px-1.5 py-0.5 text-[10px] font-bold text-warning num">
                      {r.score}/100
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{r.reason}</p>
                </li>
              ))}
              <li>
                <p className="text-[10px] leading-relaxed text-muted-foreground">
                  <Term t="quarantine">Quarantined records</Term> stay fully inspectable — the index never silently drops
                  data, which is what makes it defensible in a CPI methodology review.
                </p>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <SectionHeader title="Why this matters for the CPI" subtitle="Methodology note" className="p-4 pb-0" />
        <CardContent className="pt-3">
          <div className="grid grid-cols-1 gap-4 text-[11px] leading-relaxed text-muted-foreground md:grid-cols-3">
            <p>
              <span className="mb-1 block text-xs font-semibold text-foreground">Without normalization</span>
              An OTA listing with convenience fees, 10 kg baggage and refundable terms looks like a &ldquo;price rise&rdquo;
              against a direct non-refundable fare. The index would inherit noise instead of signal.
            </p>
            <p>
              <span className="mb-1 block text-xs font-semibold text-foreground">With AIRIS normalization</span>
              Baggage, cabin, cancellation, stops, taxes and booking window are aligned before aggregation, so measured
              movement reflects genuine market repricing.
            </p>
            <p>
              <span className="mb-1 block text-xs font-semibold text-foreground">Auditability</span>
              Every published index value traces back to quality-scored observations. Quarantined records remain inspectable,
              giving statisticians a defensible methodology trail.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
