"use client";

import { Globe, Plane, ShoppingBag } from "lucide-react";
import type { SourceCategoryStats } from "@/types";
import { formatCompactINR, formatNumber, timeAgo } from "@/lib/format";
import { DATA_SOURCES } from "@/lib/mock/handlers";
import { Term } from "@/components/ui/term";
import { cn } from "@/lib/utils";

interface SourceCardProps {
  stats: SourceCategoryStats;
}

const META = {
  airline: {
    title: "Airline Portals",
    icon: Plane,
    blurb: "Direct carrier websites — authoritative fare builds, no intermediary markup.",
  },
  ota: {
    title: "OTA Portals",
    icon: ShoppingBag,
    blurb: "Aggregator platforms — breadth of inventory; markups normalized by the quality engine.",
  },
} as const;

export function SourceCard({ stats }: SourceCardProps) {
  const meta = META[stats.category];
  const Icon = meta.icon;
  const sources = DATA_SOURCES.filter((s) => s.category === stats.category);

  return (
    <div className="rounded-lg border border-border bg-card shadow-panel">
      <div className="flex items-start justify-between gap-3 border-b border-border p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold tracking-tight">{meta.title}</h3>
            <p className="mt-0.5 max-w-[300px] text-[10px] leading-relaxed text-muted-foreground">{meta.blurb}</p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded border border-success/25 bg-success/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-success">
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-success" aria-hidden />
          Connected
        </span>
      </div>

      <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
        <Stat label={<Term t="fare-observation">Records today</Term>} value={formatNumber(stats.recordsToday)} />
        <Stat label={<Term t="data-quality">Data quality</Term>} value={`${stats.avgQualityPct}%`} />
        <Stat label="Sources live" value={`${stats.connectedCount}/${stats.totalCount}`} />
      </div>

      <ul className="divide-y divide-border/60 px-4">
        {sources.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5">
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 text-xs font-medium">
                {s.name}
                <Globe className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-normal text-muted-foreground">{s.url}</span>
              </span>
              <span
                className={cn(
                  "mt-0.5 block text-[10px]",
                  s.status === "connected" ? "text-muted-foreground" : "text-warning"
                )}
              >
                Last ingestion {timeAgo(s.lastIngestionMinutesAgo * 60)} &middot; latency {s.latencyMs} ms
              </span>
            </span>
            <span className="text-right">
              <span className="block text-xs font-semibold num">{formatNumber(s.recordsToday)}</span>
              <span className={cn("block text-[10px] num", s.dataQualityPct >= 98 ? "text-success" : "text-warning")}>
                Q {s.dataQualityPct}%
              </span>
            </span>
            <StatusDot status={s.status} />
          </li>
        ))}
      </ul>

      <p className="border-t border-border px-4 py-2 text-[10px] text-muted-foreground">
        Aggregate ingestion today: <span className="font-semibold text-foreground num">{formatCompactINR(stats.recordsToday)}</span> fare observations
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: React.ReactNode; value: string }) {
  return (
    <div className="px-4 py-3">
      <p className="label-xs">{label}</p>
      <p className="mt-1 text-base font-semibold leading-none num">{value}</p>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  return (
    <span
      title={status}
      aria-label={status}
      className={cn(
        "h-2 w-2 shrink-0 self-center rounded-full",
        status === "connected" ? "bg-success animate-pulse-dot" : status === "degraded" ? "bg-warning animate-pulse-dot" : "bg-danger"
      )}
    />
  );
}
