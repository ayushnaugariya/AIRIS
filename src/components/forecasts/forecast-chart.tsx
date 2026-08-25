"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";
import { useTheme } from "@/components/providers/theme-provider";
import { chartTheme, CHART } from "@/lib/colors";
import { ChartTooltip } from "@/components/ui/chart-tooltip";
import { generateSeries } from "@/lib/mock/series";
import type { ForecastHorizon } from "@/types";

export type ForecastScenario = "base" | "fuel" | "capacity" | "demand";

const SCENARIOS: Record<ForecastScenario, { slope: number; band: number; label: string }> = {
  base: { slope: 0.24, band: 1, label: "Base — current drivers continue" },
  fuel: { slope: 0.95, band: 1.9, label: "Fuel shock — ATF +12% passed through" },
  capacity: { slope: 0.62, band: 1.45, label: "Capacity cut — 5% of trunk departures grounded" },
  demand: { slope: -0.38, band: 1.35, label: "Demand slump — leisure bookings soften" },
};

interface ForecastChartProps {
  horizon: ForecastHorizon;
  scenario?: ForecastScenario;
}

/**
 * Historical + forecast composition with a widening confidence interval.
 * Horizon widens the projection window; scenarios stress the path.
 */
export function ForecastChart({ horizon, scenario = "base" }: ForecastChartProps) {
  const theme = useTheme().theme;
  const ct = chartTheme(theme);
  const sc = SCENARIOS[scenario];

  // Deterministic series; we display the final 45 history days + horizon days.
  const full = generateSeries("forecast-hero");
  const hist = full.points.slice(90 - 45, 90);
  const tail = full.points.slice(90, 90 + Math.min(horizon, 14)).map((p, idx) => {
    const mid = full.points[89].value! + (idx + 1) * sc.slope;
    const spread = (0.5 + (idx + 1) * 0.17) * sc.band;
    return {
      ...p,
      forecast: Math.round(mid * 10) / 10,
      fcLower: Math.round((mid - spread) * 10) / 10,
      fcUpper: Math.round((mid + spread) * 10) / 10,
    };
  });
  const extra =
    horizon > 14
      ? Array.from({ length: horizon - 14 }, (_, i) => {
          const step = 15 + i;
          const mid = full.points[89].value! + step * sc.slope;
          const spread = (0.5 + step * 0.17) * sc.band;
          const d = new Date(full.points[89].date);
          d.setDate(d.getDate() + step);
          return {
            date: d.toISOString().slice(0, 10),
            value: null,
            movingAvg: null,
            previous: null,
            forecast: Math.round(mid * 10) / 10,
            fcLower: Math.round((mid - spread) * 10) / 10,
            fcUpper: Math.round((mid + spread) * 10) / 10,
          };
        })
      : [];
  const data = [...hist, ...tail, ...extra];
  const lastHist = full.points[89];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      <div className="h-[320px]" role="img" aria-label={`National index forecast for next ${horizon} days`}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 16, right: 14, left: -6, bottom: 0 }}>
            <defs>
              <linearGradient id="gFcHistory" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART.actual} stopOpacity={theme === "light" ? 0.18 : 0.22} />
                <stop offset="100%" stopColor={CHART.actual} stopOpacity="0" />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={ct.grid} strokeDasharray="4 4" />
            <XAxis
              dataKey="date"
              tick={{ fill: ct.tick, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: ct.axis }}
              minTickGap={48}
              tickFormatter={(d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            />
            <YAxis domain={["dataMin - 3", "dataMax + 4"]} tick={{ fill: ct.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={44} />
            <RTooltip
              content={(props) => {
                const { active, label, payload } = props as unknown as {
                  active?: boolean;
                  label?: string;
                  payload?: readonly { dataKey: string | string[]; value: number | null }[];
                };
                if (!active || !payload?.length) return null;
                const get = (k: string) =>
                  payload.find((p) => (Array.isArray(p.dataKey) ? p.dataKey[0] === k : p.dataKey === k))?.value ?? null;
                return (
                  <ChartTooltip
                    active
                    label={label}
                    footnote={
                      get("fcUpper") !== null
                        ? `80% interval ${get("fcLower")?.toFixed(1)} – ${get("fcUpper")?.toFixed(1)}`
                        : "Historical observed values"
                    }
                    entries={[
                      { name: "Observed", value: get("value"), color: CHART.actual },
                      { name: "Forecast", value: get("forecast"), color: CHART.forecast },
                      { name: "Moving avg", value: get("movingAvg"), color: CHART.movingAvg },
                    ]}
                  />
                );
              }}
            />
            <Area
              dataKey={["fcLower", "fcUpper"] as unknown as string}
              stroke="none"
              fill={CHART.forecastBand}
              isAnimationActive={false}
              activeDot={false}
            />
            <Area type="monotone" dataKey="value" stroke="none" fill="url(#gFcHistory)" isAnimationActive={false} activeDot={false} />
            <Line type="monotone" dataKey="movingAvg" stroke={CHART.movingAvg} strokeWidth={1.5} dot={false} connectNulls isAnimationActive={false} activeDot={false} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={CHART.actual}
              strokeWidth={2.2}
              dot={false}
              connectNulls
              activeDot={{ r: 4, strokeWidth: 2, stroke: theme === "light" ? "#fff" : "#0B1220", fill: CHART.actual }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke={CHART.forecast}
              strokeWidth={2.2}
              strokeDasharray="6 4"
              dot={false}
              connectNulls
              isAnimationActive={false}
              activeDot={false}
            />
            <ReferenceDot
              x={lastHist.date}
              y={lastHist.value ?? 128}
              r={4.5}
              fill={CHART.actual}
              stroke={theme === "light" ? "#fff" : "#0B1220"}
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <Legend color={CHART.actual} label={`Historical (${45}d)`} />
        <Legend color={CHART.forecast} label={`Forecast (${horizon}d)`} dashed />
        <Legend color={CHART.forecastBand.replace(/0\.10\)$/, "0.35)")} label="Confidence interval" box />
        <span className="ml-auto text-[10px] font-medium text-warning">Scenario: {sc.label}</span>
      </div>
    </motion.div>
  );
}

function Legend({ color, label, dashed, box }: { color: string; label: string; dashed?: boolean; box?: boolean }) {
  return (
    <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
      {box ? (
        <span className="h-2.5 w-4 rounded-sm border border-border" style={{ background: color }} aria-hidden />
      ) : (
        <span
          className="inline-block h-0.5 w-4 rounded-full"
          style={{ background: dashed ? `repeating-linear-gradient(90deg, ${color} 0 4px, transparent 4px 7px)` : color }}
          aria-hidden
        />
      )}
      {label}
    </span>
  );
}
