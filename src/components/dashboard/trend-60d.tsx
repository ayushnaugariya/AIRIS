"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "@/components/providers/theme-provider";
import { chartTheme, REGION_COLORS } from "@/lib/colors";
import { ChartTooltip } from "@/components/ui/chart-tooltip";
import { generateSeries } from "@/lib/mock/series";
import { formatDateShort } from "@/lib/format";

const REGION_TARGETS: { name: string; target: number }[] = [
  { name: "North", target: 132.4 },
  { name: "South", target: 124.1 },
  { name: "East", target: 121.6 },
  { name: "West", target: 129.8 },
];

/**
 * 60-day national composite vs regional sub-indices — the "are zones
 * diverging or moving together?" view.
 */
export function Trend60D() {
  const theme = useTheme().theme;
  const ct = chartTheme(theme);

  const data = useMemo(() => {
    const national = generateSeries("national").points.slice(30, 90);
    const rows = national.map((p, i) => {
      const row: Record<string, string | number | null> = { date: p.date, National: p.value };
      REGION_TARGETS.forEach((r) => {
        const series = generateSeries(`region-${r.name}`, r.target).points;
        row[r.name] = series[30 + i]?.value ?? null;
      });
      return row;
    });
    return rows;
  }, []);

  return (
    <div>
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: -6, bottom: 0 }}>
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
              domain={["dataMin - 2", "dataMax + 2"]}
              tick={{ fill: ct.tick, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={42}
            />
            <RTooltip
              content={(props) => {
                const { active, label, payload } = props as unknown as {
                  active?: boolean;
                  label?: string;
                  payload?: readonly { name: string; value: number | null; color?: string }[];
                };
                if (!active || !payload?.length) return null;
                return (
                  <ChartTooltip
                    active
                    label={label}
                    entries={payload
                      .slice()
                      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
                      .map((p) => ({ name: p.name, value: p.value, color: p.color ?? "#2563EB" }))}
                  />
                );
              }}
            />
            <Line type="monotone" dataKey="National" stroke="#2563EB" strokeWidth={2.4} dot={false} isAnimationActive={false} activeDot={{ r: 3.5 }} />
            {REGION_TARGETS.map((r) => (
              <Line
                key={r.name}
                type="monotone"
                dataKey={r.name}
                stroke={REGION_COLORS[r.name] ?? "#94A3B8"}
                strokeWidth={1.3}
                strokeDasharray="5 4"
                strokeOpacity={0.8}
                dot={false}
                isAnimationActive={false}
                activeDot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="h-0.5 w-4 rounded-full bg-[#2563EB]" aria-hidden /> National
        </span>
        {REGION_TARGETS.map((r) => (
          <span key={r.name} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="inline-block h-0.5 w-4" style={{ background: `repeating-linear-gradient(90deg, ${REGION_COLORS[r.name]} 0 4px, transparent 4px 7px)` }} aria-hidden />
            {r.name}
          </span>
        ))}
      </div>
    </div>
  );
}
