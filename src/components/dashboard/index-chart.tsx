"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "@/components/providers/theme-provider";
import { chartTheme, CHART } from "@/lib/colors";
import { ChartTooltip } from "@/components/ui/chart-tooltip";
import { formatIndex } from "@/lib/format";
import type { SeriesResponse } from "@/types";
import { motion } from "framer-motion";

interface IndexChartProps {
  series: SeriesResponse;
  height?: number;
}

/**
 * Hero chart — actual index, moving average, previous-period ghost,
 * forecast with confidence band and intelligence event annotations.
 */
export function IndexChart({ series, height = 340 }: IndexChartProps) {
  const theme = useTheme().theme;
  const ct = chartTheme(theme);

  const lastActual = [...series.points].reverse().find((p) => p.value !== null);
  const lastDate = lastActual?.date;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div style={{ height }} role="img" aria-label="India airfare price index over the last 90 days with forecast">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={series.points} margin={{ top: 28, right: 14, left: -6, bottom: 0 }}>
            <defs>
              <linearGradient id="gIndexActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART.actual} stopOpacity={theme === "light" ? 0.2 : 0.24} />
                <stop offset="100%" stopColor={CHART.actual} stopOpacity="0" />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} stroke={ct.grid} strokeDasharray="4 4" />
            <XAxis
              dataKey="date"
              tick={{ fill: ct.tick, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: ct.axis }}
              minTickGap={56}
              tickFormatter={(d: string) =>
                new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
              }
            />
            <YAxis
              domain={["dataMin - 3", "dataMax + 3"]}
              tick={{ fill: ct.tick, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={44}
            />
            <RTooltip
              content={(props) => {
                const { active, label, payload } = props as unknown as {
                  active?: boolean;
                  label?: string;
                  payload?: readonly { dataKey: string | string[]; value: number | null; name?: string }[];
                };
                if (!active || !payload?.length) return null;
                const get = (k: string) => payload.find((p) => (Array.isArray(p.dataKey) ? p.dataKey[0] === k : p.dataKey === k))?.value ?? null;
                return (
                  <ChartTooltip
                    active
                    label={label}
                    footnote={
                      get("fcUpper") !== null && get("fcLower") !== null
                        ? `Confidence band ${get("fcLower")?.toFixed(1)} – ${get("fcUpper")?.toFixed(1)}`
                        : undefined
                    }
                    entries={[
                      { name: "Index", value: get("value"), color: CHART.actual },
                      { name: "Moving avg", value: get("movingAvg"), color: CHART.movingAvg },
                      { name: "Prev. period", value: get("previous"), color: CHART.previous },
                      { name: "Forecast", value: get("forecast"), color: CHART.forecast },
                    ]}
                  />
                );
              }}
            />

            {/* Intelligence annotations */}
            {series.annotations.map((a) => (
              <ReferenceLine
                key={a.id}
                x={a.date}
                stroke={CHART.annotation}
                strokeDasharray="2 5"
                strokeOpacity={0.75}
                label={{
                  value: a.label,
                  position: "insideTopLeft",
                  offset: 12,
                  fill: theme === "light" ? "#B45309" : CHART.annotation,
                  fontSize: 10,
                  letterSpacing: "0.06em",
                  fontWeight: 600,
                }}
              />
            ))}

            {/* Forecast confidence band */}
            <Area
              dataKey={["fcLower", "fcUpper"] as unknown as string}
              stroke="none"
              fill={CHART.forecastBand}
              isAnimationActive={false}
              connectNulls
              activeDot={false}
              legendType="none"
            />

            <Line
              type="monotone"
              dataKey="previous"
              stroke={CHART.previous}
              strokeWidth={1}
              strokeDasharray="4 4"
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="movingAvg"
              stroke={CHART.movingAvg}
              strokeWidth={1.5}
              dot={false}
              activeDot={false}
              connectNulls
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="none"
              fill="url(#gIndexActual)"
              isAnimationActive={false}
              activeDot={false}
              legendType="none"
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={CHART.actual}
              strokeWidth={2.2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: theme === "light" ? "#fff" : "#0B1220", fill: CHART.actual }}
              connectNulls
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke={CHART.forecast}
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              activeDot={false}
              connectNulls
              isAnimationActive={false}
            />

            {/* Current value marker */}
            {lastDate && lastActual?.value != null && (
              <ReferenceDot
                x={lastDate}
                y={lastActual.value}
                r={4.5}
                fill={CHART.actual}
                stroke={theme === "light" ? "#fff" : "#0B1220"}
                strokeWidth={2}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <LegendSwatch color={CHART.actual} label="Actual" line />
        <LegendSwatch color={CHART.movingAvg} label="Moving average" line />
        <LegendSwatch color={CHART.previous} label="Previous period" dashed />
        <LegendSwatch color={CHART.forecast} label="Forecast" dashed />
        <LegendSwatch color={CHART.forecastBand.replace(/0\.10\)$/, "0.35)")} label="Confidence band" box />
        <span className="ml-auto flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="inline-block h-px w-4 border-t border-dashed border-warning" aria-hidden />
          Event annotation &middot; latest index {formatIndex(series.lastValue)}
        </span>
      </div>
    </motion.div>
  );
}

function LegendSwatch({
  color,
  label,
  line,
  dashed,
  box,
}: {
  color: string;
  label: string;
  line?: boolean;
  dashed?: boolean;
  box?: boolean;
}) {
  return (
    <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
      {box ? (
        <span className="h-2.5 w-4 rounded-sm border border-border" style={{ background: color }} aria-hidden />
      ) : (
        <span
          className="inline-block h-0.5 w-4 rounded-full"
          style={{
            background: dashed
              ? `repeating-linear-gradient(90deg, ${color} 0 4px, transparent 4px 7px)`
              : color,
          }}
          aria-hidden
        />
      )}
      {label}
      {!line && !dashed && !box ? null : null}
    </span>
  );
}
