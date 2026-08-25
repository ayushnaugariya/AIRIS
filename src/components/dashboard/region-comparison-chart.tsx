"use client";

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
import { formatIndex, formatDateShort } from "@/lib/format";
import type { RegionIndex } from "@/types";

interface RegionComparisonChartProps {
  regions: RegionIndex[];
  /** Region to emphasize; others dim (from the global topbar filter). */
  highlight?: string;
}

/** Multi-region index comparison over the trailing week. */
export function RegionComparisonChart({ regions, highlight }: RegionComparisonChartProps) {
  const theme = useTheme().theme;
  const ct = chartTheme(theme);

  // Compose a shared time axis (7 points) with each region's trend aligned.
  const data = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const row: Record<string, string | number | null> = { date: d.toISOString().slice(0, 10) };
    regions.forEach((r) => {
      row[r.region] = r.trend[i] ?? null;
    });
    return row;
  });

  return (
    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -4, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={ct.grid} strokeDasharray="4 4" />
          <XAxis
            dataKey="date"
            tick={{ fill: ct.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: ct.axis }}
            tickFormatter={(d: string) => formatDateShort(d)}
          />
          <YAxis
            domain={["dataMin - 2", "dataMax + 2"]}
            tick={{ fill: ct.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={(v: number) => formatIndex(v, 0)}
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
                  entries={payload.map((p) => ({ name: p.name, value: p.value, color: p.color ?? "#2563EB" }))}
                />
              );
            }}
          />
          {regions.map((r) => {
            const emphasized = !highlight || highlight === "all" || highlight === r.region;
            return (
              <Line
                key={r.region}
                type="monotone"
                dataKey={r.region}
                stroke={REGION_COLORS[r.region] ?? "#2563EB"}
                strokeWidth={emphasized ? (r.region === highlight ? 2.6 : 1.6) : 1.2}
                strokeOpacity={emphasized ? 1 : 0.28}
                dot={false}
                isAnimationActive={false}
                activeDot={{ r: 3.5 }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-1 flex flex-wrap gap-x-3.5 gap-y-1">
        {regions.map((r) => (
          <span
            key={r.region}
            className={`flex items-center gap-1.5 text-[10px] ${
              highlight && highlight !== "all" && highlight !== r.region ? "text-muted-foreground/40" : "text-muted-foreground"
            }`}
          >
            <span className="h-0.5 w-3.5 rounded-full" style={{ background: REGION_COLORS[r.region] ?? "#2563EB" }} aria-hidden />
            {r.region}
          </span>
        ))}
      </div>
    </div>
  );
}
