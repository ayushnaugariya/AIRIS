"use client";

import type { AnomalyStats } from "@/types";
import { AlertOctagon, AlertTriangle, Activity, CheckCircle2 } from "lucide-react";
import { Term } from "@/components/ui/term";
import { cn } from "@/lib/utils";
import { formatPct } from "@/lib/format";

/** Summary tiles above the anomaly table. */
export function AnomalyStatsRow({ stats }: { stats: AnomalyStats }) {
  const tiles = [
    {
      id: "total",
      icon: Activity,
      label: <Term t="anomaly">Total detected</Term>,
      value: String(stats.total),
      valueClass: "text-foreground",
      hint: `${formatPct(stats.resolutionRatePct)} resolution rate`,
    },
    {
      id: "critical",
      icon: AlertOctagon,
      label: <Term t="severity">Critical</Term>,
      value: String(stats.critical),
      valueClass: "text-danger",
      hint: "Immediate review required",
    },
    {
      id: "high",
      icon: AlertTriangle,
      label: <Term t="severity">High</Term>,
      value: String(stats.high),
      valueClass: "text-warning",
      hint: "Elevated deviation from model",
    },
    {
      id: "moderate",
      icon: CheckCircle2,
      label: <Term t="severity">Moderate</Term>,
      value: String(stats.moderate),
      valueClass: "text-accent",
      hint: "Within watchlist thresholds",
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {tiles.map((t) => (
        <div key={t.id} className="rounded-lg border border-border bg-card p-3.5 shadow-panel">
          <div className="flex items-center justify-between">
            <p className="label-xs">{t.label}</p>
            <t.icon className={cn("h-4 w-4", t.valueClass)} strokeWidth={1.75} />
          </div>
          <p className={cn("mt-2 text-2xl font-semibold leading-none num", t.valueClass)}>{t.value}</p>
          <p className="mt-1.5 text-[10px] text-muted-foreground">{t.hint}</p>
        </div>
      ))}
    </div>
  );
}
