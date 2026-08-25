"use client";

import { useMemo } from "react";
import { Metric } from "@/components/ui/metric";
import type { SeriesResponse } from "@/types";

/** Fills the space under the hero chart with real analytical value. */
export function IndexStatsStrip({ series }: { series: SeriesResponse }) {
  const stats = useMemo(() => {
    const hist = series.points.slice(0, 90).map((p) => p.value ?? 0);
    const last = hist[hist.length - 1] ?? 0;
    const high = Math.max(...hist);
    const low = Math.min(...hist);
    const avg = hist.reduce((a, b) => a + b, 0) / hist.length;
    const tail = hist.slice(-30);
    const mean = tail.reduce((a, b) => a + b, 0) / tail.length;
    const vol = Math.sqrt(tail.reduce((a, b) => a + (b - mean) ** 2, 0) / tail.length);
    const fc7 = series.points[90 + 6]?.forecast ?? null;
    return { last, high, low, avg, vol, fc7 };
  }, [series]);

  return (
    <div className="grid grid-cols-3 gap-x-4 gap-y-3 border-t border-border pt-3 sm:grid-cols-6">
      <Metric label="90d high" value={stats.high.toFixed(1)} valueClassName="text-danger" />
      <Metric label="90d low" value={stats.low.toFixed(1)} valueClassName="text-success" />
      <Metric label="90d mean" value={stats.avg.toFixed(1)} />
      <Metric label="30d volatility" info="volatility" value={`±${stats.vol.toFixed(1)}`} hint="σ of daily index" />
      <Metric label="7d forecast" info="forecast" value={stats.fc7 ? stats.fc7.toFixed(1) : "—"} valueClassName="text-accent" />
      <Metric label="Base period" value="2024 = 100" hint="Laspeyres-type chained" />
    </div>
  );
}
