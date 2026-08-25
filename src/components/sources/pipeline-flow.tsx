"use client";

import {
  Database,
  DownloadCloud,
  Gauge,
  LayoutDashboard,
  ShieldCheck,
  SlidersHorizontal,
  Cpu,
  ChevronRight,
} from "lucide-react";
import type { PipelineStage } from "@/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const STAGE_ICONS: Record<string, typeof Database> = {
  source: Database,
  ingestion: DownloadCloud,
  validation: ShieldCheck,
  normalization: SlidersHorizontal,
  index: Gauge,
  ai: Cpu,
  dashboard: LayoutDashboard,
};

/** Source → … → Dashboard flow with live health per stage. */
export function PipelineFlow({ stages }: { stages: PipelineStage[] }) {
  return (
    <div>
      {/* Desktop horizontal */}
      <ol className="hidden items-stretch gap-1 lg:flex">
        {stages.map((s, i) => (
          <li key={s.key} className="flex min-w-0 flex-1 items-stretch">
            <StageNode stage={s} />
            {i < stages.length - 1 && (
              <span className="flex items-center px-0.5 text-muted-foreground/60" aria-hidden>
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </li>
        ))}
      </ol>

      {/* Mobile / tablet vertical */}
      <ol className="space-y-2 lg:hidden">
        {stages.map((s) => (
          <li key={s.key}>
            <StageNode stage={s} vertical />
          </li>
        ))}
      </ol>
    </div>
  );
}

function StageNode({ stage, vertical }: { stage: PipelineStage; vertical?: boolean }) {
  const Icon = STAGE_ICONS[stage.key] ?? Database;
  const ok = stage.status === "healthy";
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "group w-full cursor-default rounded-lg border bg-card p-3 transition-colors hover:border-primary/40",
            vertical ? "flex items-center gap-3" : "flex flex-col items-center text-center"
          )}
        >
          <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-primary">
            <Icon className="h-4 w-4" />
            <span
              className={cn(
                "absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ring-2 ring-card",
                ok ? "bg-success animate-pulse-dot" : "bg-warning"
              )}
              aria-hidden
            />
          </span>
          <div className={cn("min-w-0", vertical ? "" : "mt-2")}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em]">{stage.label}</p>
            <p className="mt-0.5 truncate text-[10px] font-medium num text-accent">{stage.metric}</p>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side={vertical ? "right" : "bottom"}>
        <p>{stage.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}
