"use client";

import {
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { useTheme } from "@/components/providers/theme-provider";
import { chartTheme } from "@/lib/colors";
import { formatIndex, formatPct } from "@/lib/format";
import type { AirlineIndex } from "@/types";

/**
 * Service vs price positioning: on-time performance (x) against carrier index (y),
 * bubble size = market share. Premium carriers sit top-left; value carriers bottom-right.
 */
export function AirlineScatter({ data }: { data: AirlineIndex[] }) {
  const theme = useTheme().theme;
  const ct = chartTheme(theme);
  const points = data.map((a) => ({ ...a, x: a.onTimePct, y: a.index }));

  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 12, right: 16, left: -4, bottom: 4 }}>
          <CartesianGrid stroke={ct.grid} strokeDasharray="4 4" />
          <XAxis
            type="number"
            dataKey="x"
            name="On-time"
            domain={[68, 90]}
            tick={{ fill: ct.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: ct.axis }}
            tickFormatter={(v: number) => `${v}%`}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Index"
            domain={[114, 138]}
            tick={{ fill: ct.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={(v: number) => formatIndex(v, 0)}
          />
          <ZAxis type="number" dataKey="marketSharePct" range={[80, 900]} />
          <ReferenceLine y={128.6} stroke={ct.axis} strokeDasharray="4 4" label={{ value: "National index", position: "insideTopRight", fontSize: 10, fill: ct.tick }} />
          <RTooltip
            content={(props) => {
              const { active, payload } = props as unknown as {
                active?: boolean;
                payload?: readonly { payload: AirlineIndex & { x: number; y: number } }[];
              };
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="rounded-lg border border-border bg-popover/95 px-3 py-2 shadow-raised">
                  <p className="text-xs font-semibold">{d.name}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground num">Index {formatIndex(d.y)}</p>
                  <p className="text-[11px] text-muted-foreground num">On-time {formatPct(d.x, { signed: false })}</p>
                  <p className="text-[11px] text-muted-foreground num">Share {d.marketSharePct}%</p>
                </div>
              );
            }}
          />
          <Scatter data={points} isAnimationActive={false}>
            {points.map((p) => (
              <Cell key={p.code} fill={`${p.color}B3`} stroke={p.color} strokeWidth={1.5} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
        Bubble area = market share. Carriers charging above the national line while delivering lower on-time performance are flagged by the quality engine.
      </p>
    </div>
  );
}
