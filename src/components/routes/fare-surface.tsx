"use client";

import dynamic from "next/dynamic";
import type { Data } from "plotly.js";
import { useMemo } from "react";
import { PlotlyFallback } from "@/components/charts/plotly-chart";

const PlotlyChartDynamic = dynamic(() => import("@/components/charts/plotly-chart").then((m) => m.PlotlyChart), {
  ssr: false,
  loading: () => <PlotlyFallback height={280} />,
});

const BUCKETS = ["0–1d", "2–3d", "4–7d", "8–14d", "15–30d", "30d+"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Fare surface — median fare by booking window × departure weekday.
 * Plotly heatmap; the deep diagonal shows late bookings are uniformly dearer.
 */
export function FareSurface({ baseFare }: { baseFare: number }) {
  const data = useMemo<Data[]>(() => {
    // Deterministic surface: rows = booking window, cols = departure day.
    const rowFactor = [1.62, 1.32, 1.14, 1.0, 0.885, 0.81];
    const colFactor = [0.97, 0.96, 0.965, 0.98, 1.08, 1.04, 0.99];
    const z = rowFactor.map((rf) => colFactor.map((cf) => Math.round(baseFare * rf * cf)));
    return [
      {
        type: "heatmap",
        z,
        x: DAYS,
        y: BUCKETS,
        colorscale: [
          [0, "#0B1220"],
          [0.45, "#172B4D"],
          [0.7, "#1D4ED8"],
          [0.9, "#38BDF8"],
          [1, "#7DD3FC"],
        ],
        hovertemplate:
          "<b>Depart %{x}</b>, booked %{y} ahead<br>₹%{z:,.0f} median fare<extra></extra>",
        colorbar: {
          thickness: 10,
          outlinewidth: 0,
          tickfont: { size: 9 },
          tickprefix: "₹",
          len: 0.85,
        },
      } as Data,
    ];
  }, [baseFare]);

  return (
    <PlotlyChartDynamic
      data={data}
      height={280}
      layout={{
        xaxis: { tickangle: 0 },
        yaxis: { autorange: "reversed" },
      }}
    />
  );
}
