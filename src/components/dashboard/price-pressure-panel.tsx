"use client";

import { useRouter } from "next/navigation";
import { Info, MoveRight } from "lucide-react";
import type { PricePressureEntry } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PRESSURE_MODEL_FACTORS } from "@/lib/mock/handlers";
import { formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";

const SCORE_BAR: Record<string, string> = {
  high: "bg-danger",
  elevated: "bg-warning",
  moderate: "bg-accent",
  low: "bg-success",
};

interface PricePressurePanelProps {
  entries: PricePressureEntry[];
  limit?: number;
}

/** Ranked route-level early-warning panel with the composite pressure score. */
export function PricePressurePanel({ entries, limit = 8 }: PricePressurePanelProps) {
  const router = useRouter();
  const top = entries.slice(0, limit);
  return (
    <div>
      <div className="mb-1 grid grid-cols-[18px_1fr_auto_58px] items-center gap-2">
        <span className="label-xs">#</span>
        <span className="label-xs">Route</span>
        <span className="label-xs text-center">Level</span>
        <span className="label-xs text-right">Score</span>
      </div>
      <ol className="divide-y divide-border">
        {top.map((e) => (
          <li key={e.routeId}>
            <button
              onClick={() => router.push(`/routes?id=${e.routeId}`)}
              className="group grid w-full grid-cols-[18px_1fr_auto_58px] items-center gap-2 rounded-md px-1 py-2 text-left transition-colors hover:bg-muted/60"
            >
              <span className="text-[11px] font-medium text-muted-foreground num">{e.rank}</span>
              <span className="min-w-0">
                <span className="flex items-center gap-1 text-xs font-semibold tracking-tight">
                  {e.routeLabel.split(" → ")[0]}
                  <MoveRight className="h-3 w-3 shrink-0 text-muted-foreground" strokeWidth={2.5} />
                  {e.routeLabel.split(" → ")[1]}
                </span>
                <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                  {e.primaryDriver} &middot; {formatPct(e.change7dPct)} 7d
                </span>
              </span>
              <StatusBadge level={e.pressureLevel} size="sm" />
              <span className="text-right">
                <span className="block text-sm font-semibold leading-none num">{e.pressureScore}</span>
                <span className="mt-1 block h-1 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
                  <span
                    className={cn("block h-full rounded-full", SCORE_BAR[e.pressureLevel])}
                    style={{ width: `${e.pressureScore}%` }}
                  />
                </span>
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-3 flex items-start gap-2 rounded-md border border-border bg-background/50 p-2.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <button aria-label="How the pressure score is computed" className="mt-0.5">
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            Composite of recent movement, historical deviation, booking velocity, demand and anomaly signals.
          </TooltipContent>
        </Tooltip>
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Pressure score model.</span> Combines{" "}
          {PRESSURE_MODEL_FACTORS.slice(0, -1).join(", ").toLowerCase()} and{" "}
          {PRESSURE_MODEL_FACTORS.slice(-1)[0].toLowerCase()}, weighted per route history.
        </p>
      </div>
    </div>
  );
}
