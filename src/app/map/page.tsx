"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Globe2, Map as MapIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { IndiaMap } from "@/components/map/india-map";
import { RouteMapSection } from "@/components/dashboard/route-map-section";
import { StatusBadge } from "@/components/ui/status-badge";
import { TrendPill } from "@/components/ui/trend-pill";
import { LoadingState } from "@/components/ui/states";
import { useApiData } from "@/hooks/use-api-data";
import { useFilters } from "@/components/providers/filters-provider";
import { airisApi } from "@/lib/api";
import { formatINR, formatIndex, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PricePressureEntry } from "@/types";

type MapView = "live" | "outline";

function MapInner() {
  const params = useSearchParams();
  const router = useRouter();
  const filters = useFilters();
  const [view, setView] = useState<MapView>("live");
  const [selectedId, setSelectedId] = useState<string | null>(filters.routeId === "all" ? "DEL-BOM" : filters.routeId);
  const pressure = useApiData(() => airisApi.routes.getPricePressure(), []);
  const selected = useApiData(
    () => airisApi.routes.get(selectedId ?? "DEL-BOM"),
    [selectedId]
  );

  useEffect(() => {
    const fromUrl = params.get("focus") ?? params.get("id");
    if (fromUrl) setSelectedId(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    filters.setRouteId(id);
  };

  const s = selected.data;

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Geospatial intelligence"
        title="India Route Intelligence Map"
        subtitle="Every monitored sector traced across the subcontinent — arc colour is price pressure, click any route to trace its flights."
        actions={
          <div className="inline-flex rounded-md bg-muted p-0.5" role="group" aria-label="Map view">
            {(
              [
                { key: "live", label: "Live map", icon: Globe2 },
                { key: "outline", label: "Outline", icon: MapIcon },
              ] as const
            ).map((m) => (
              <button
                key={m.key}
                onClick={() => setView(m.key)}
                aria-pressed={view === m.key}
                className={cn(
                  "flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors",
                  view === m.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <m.icon className="h-3.5 w-3.5" />
                {m.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[1fr_380px]">
        {/* Map */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            {view === "live" ? (
              <RouteMapSection focusRouteId={selectedId} />
            ) : (
              <IndiaMap focusRouteId={selectedId} onSelectRoute={handleSelect} />
            )}
          </CardContent>
        </Card>

        {/* Side panels */}
        <div className="flex flex-col gap-4">
          <Card>
            <SectionHeader title="Top pressure routes" info="pressure-score" subtitle="Click to trace on the map" className="p-4 pb-1" />
            <CardContent className="max-h-[300px] overflow-y-auto pt-0">
              {pressure.loading && !pressure.data ? (
                <LoadingState variant="rows" rows={6} />
              ) : pressure.error ? (
                <p className="p-3 text-xs text-danger">{pressure.error}</p>
              ) : (
                <ul className="divide-y divide-border/60">
                  {(pressure.data as PricePressureEntry[]).slice(0, 10).map((e) => (
                    <li key={e.routeId}>
                      <button
                        onClick={() => handleSelect(e.routeId)}
                        aria-pressed={e.routeId === selectedId}
                        className={`flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left transition-colors hover:bg-muted/60 ${e.routeId === selectedId ? "bg-primary/[0.08]" : ""}`}
                      >
                        <span className="w-4 text-[10px] text-muted-foreground num">{e.rank}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-bold num">{e.routeLabel.replace(" → ", "–")}</span>
                          <span className="block truncate text-[10px] text-muted-foreground">{e.primaryDriver}</span>
                        </span>
                        <StatusBadge level={e.pressureLevel} size="sm" />
                        <span className="w-9 text-right text-xs font-bold num">{e.pressureScore}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Selected route + flight trace list */}
          <Card>
            <SectionHeader
              title={s ? `${s.originCode} → ${s.destinationCode}` : "Route trace"}
              subtitle={s ? `${s.originCity} → ${s.destinationCity} · ${formatNumber(s.distanceKm)} km` : undefined}
              className="p-4 pb-2"
              actions={s ? <TrendPill value={s.change7dPct} suffix="7d" /> : undefined}
            />
            <CardContent className="pt-0">
              {!s ? (
                <LoadingState variant="rows" rows={5} />
              ) : (
                <>
                  <div className="mb-3 grid grid-cols-3 gap-3 rounded-md border border-border bg-background/50 p-2.5">
                    <div>
                      <p className="label-xs">Fare</p>
                      <p className="text-sm font-bold num">{formatINR(s.currentFare)}</p>
                    </div>
                    <div>
                      <p className="label-xs">Index</p>
                      <p className="text-sm font-semibold num">{formatIndex(s.indexValue)}</p>
                    </div>
                    <div>
                      <p className="label-xs">Pressure</p>
                      <StatusBadge level={s.pressureLevel} size="sm" className="mt-0.5" />
                    </div>
                  </div>
                  <p className="label-xs mb-1.5">Flight trace · {s.flights.length} services today</p>
                  <ul className="max-h-[340px] space-y-1.5 overflow-y-auto pr-1">
                    {s.flights.map((f) => (
                      <li key={f.flightNo} className="rounded-md border border-border bg-background/40 px-2.5 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold num">{f.flightNo}</span>
                          <span className="text-xs font-semibold text-success num">{formatINR(f.bestFare)}</span>
                        </div>
                        <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                          {f.airline} · {f.aircraft}
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground num">
                          {f.depTime} → {f.arrTime} IST · {f.durationLabel} · {f.bestSource}
                        </p>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => router.push(`/routes?id=${s.id}`)}
                    className="mt-3 w-full rounded-md border border-border px-3 py-2 text-xs font-medium transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    Open full route analysis
                  </button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function IndiaMapPage() {
  return (
    <Suspense fallback={<LoadingState variant="chart" />}>
      <MapInner />
    </Suspense>
  );
}
