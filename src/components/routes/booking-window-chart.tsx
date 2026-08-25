"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "@/components/providers/theme-provider";
import { chartTheme, CHART } from "@/lib/colors";
import { ChartTooltip } from "@/components/ui/chart-tooltip";
import { formatINR } from "@/lib/format";
import type { BookingWindowBucket } from "@/types";

const BUCKET_COLORS = ["#EF4444", "#F59E0B", "#38BDF8", "#2563EB", "#14B8A6", "#14B8A6"];

/**
 * How the same route prices across advance-purchase windows.
 * The cheapest band is highlighted teal — a key CPI-relevant insight.
 */
export function BookingWindowChart({ data }: { data: BookingWindowBucket[] }) {
  const theme = useTheme().theme;
  const ct = chartTheme(theme);
  const cheapest = Math.min(...data.map((d) => d.avgFare));

  return (
    <div className="h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke={ct.grid} strokeDasharray="4 4" />
          <XAxis
            dataKey="bucket"
            tick={{ fill: ct.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: ct.axis }}
          />
          <YAxis
            domain={[0, "dataMax + 900"]}
            tick={{ fill: ct.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={52}
            tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
          />
          <RTooltip
            cursor={{ fill: "rgba(148,163,184,0.08)" }}
            content={(props) => {
              const { active, payload } = props as unknown as {
                active?: boolean;
                payload?: readonly { payload: BookingWindowBucket }[];
              };
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <ChartTooltip
                  active
                  label={`Book ${d.bucket} ahead`}
                  footnote={`${d.sampleCount.toLocaleString("en-IN")} fare observations`}
                  entries={[{ name: "Median fare", value: d.avgFare, color: CHART.actual, formatter: (v) => formatINR(v) }]}
                />
              );
            }}
          />
          <Bar dataKey="avgFare" radius={[4, 4, 0, 0]} maxBarSize={46}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.avgFare === cheapest ? CHART.teal : i < 2 ? "#7F1D1D" : BUCKET_COLORS[Math.min(i + 2, 5)]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
        Fares rise sharply inside 7 days to departure. The 15–30 day window is the stable reference band used for index aggregation.
      </p>
    </div>
  );
}
