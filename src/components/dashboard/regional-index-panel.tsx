"use client";

import type { RegionIndex } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { TrendPill } from "@/components/ui/trend-pill";
import { Sparkline } from "@/components/ui/sparkline";
import { REGION_COLORS } from "@/lib/colors";
import { formatIndex } from "@/lib/format";

interface RegionalIndexPanelProps {
  data: RegionIndex[];
  highlight?: string; // region name when filtered
}

/** Six-zone index rows: value, change, pressure and micro trend. */
export function RegionalIndexPanel({ data, highlight }: RegionalIndexPanelProps) {
  return (
    <div>
      <div className="mb-1 grid grid-cols-[1fr_52px_56px_84px_88px] items-center gap-2">
        <span className="label-xs">Region</span>
        <span className="label-xs text-right">Index</span>
        <span className="label-xs text-right">Chg</span>
        <span className="label-xs text-center">Pressure</span>
        <span className="label-xs hidden text-right sm:block">7-day</span>
      </div>
      <ul className="divide-y divide-border">
        {data.map((r) => {
          const dim = highlight && highlight !== "all" && highlight !== r.region;
          return (
            <li
              key={r.region}
              className={`grid grid-cols-[1fr_52px_56px_84px] items-center gap-2 py-2 transition-opacity sm:grid-cols-[1fr_52px_56px_84px_88px] ${
                dim ? "opacity-40" : ""
              }`}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: REGION_COLORS[r.region] ?? "#2563EB" }} aria-hidden />
                <span className="truncate text-xs font-medium">{r.region}</span>
              </div>
              <span className="text-right text-sm font-semibold num">{formatIndex(r.index)}</span>
              <TrendPill value={r.changePct} size="xs" className="justify-end" />
              <StatusBadge level={r.pressureLevel} size="sm" className="justify-center" />
              <div className="hidden justify-end sm:flex">
                <Sparkline data={r.trend} stroke={REGION_COLORS[r.region] ?? "#2563EB"} width={80} height={24} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
