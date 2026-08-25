"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "@/components/providers/theme-provider";
import { chartTheme, CHART } from "@/lib/colors";
import { ChartTooltip } from "@/components/ui/chart-tooltip";
import { formatINR, formatDateShort } from "@/lib/format";
import type { FareTrendPoint } from "@/types";

/** 45-day observed fare band + average and moving average. */
export function FareTrendChart({ data }: { data: FareTrendPoint[] }) {
  const theme = useTheme().theme;
  const ct = chartTheme(theme);

  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 12, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="gFareBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART.slate} stopOpacity={0.16} />
              <stop offset="100%" stopColor={CHART.slate} stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={ct.grid} strokeDasharray="4 4" />
          <XAxis
            dataKey="date"
            tick={{ fill: ct.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: ct.axis }}
            minTickGap={44}
            tickFormatter={(d: string) => formatDateShort(d)}
          />
          <YAxis
            domain={["dataMin - 300", "dataMax + 400"]}
            tick={{ fill: ct.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={52}
            tickFormatter={(v: number) => `₹${(v / 1000).toFixed(1)}k`}
          />
          <RTooltip
            content={(props) => {
              const { active, label, payload } = props as unknown as {
                active?: boolean;
                label?: string;
                payload?: readonly { dataKey: string; value: number | null }[];
              };
              if (!active || !payload?.length) return null;
              const get = (k: string) => payload.find((p) => p.dataKey === k)?.value ?? null;
              const fmt = (v: number | null): string => (v == null ? "—" : formatINR(v));
              return (
                <ChartTooltip
                  active
                  label={label}
                  entries={[
                    { name: "Median fare", value: get("avgFare"), color: CHART.actual, formatter: fmt },
                    { name: "Moving avg", value: get("movingAvg"), color: CHART.movingAvg, formatter: fmt },
                    { name: "Observed low", value: get("lowestFare"), color: "#64748B", formatter: fmt },
                    { name: "Observed high", value: get("highestFare"), color: "#94A3B8", formatter: fmt },
                  ]}
                />
              );
            }}
          />
          <Area
            dataKey={["lowestFare", "highestFare"] as unknown as string}
            stroke="none"
            fill="url(#gFareBand)"
            isAnimationActive={false}
            activeDot={false}
          />
          <Line type="monotone" dataKey="movingAvg" stroke={CHART.movingAvg} strokeWidth={1.5} dot={false} connectNulls isAnimationActive={false} activeDot={false} />
          <Line
            type="monotone"
            dataKey="avgFare"
            stroke={CHART.actual}
            strokeWidth={2.2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: theme === "light" ? "#fff" : "#0B1220", fill: CHART.actual }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
