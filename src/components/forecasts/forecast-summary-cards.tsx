"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { ForecastSummary } from "@/types";
import { formatIndex, formatPct } from "@/lib/format";
import { Term } from "@/components/ui/term";
import type { GlossaryKey } from "@/lib/glossary";
import { cn } from "@/lib/utils";

interface ForecastSummaryCardsProps {
  summary: ForecastSummary;
}

/** Current vs forecast vs movement — the WHAT NEXT answer block. */
export function ForecastSummaryCards({ summary }: ForecastSummaryCardsProps) {
  const Icon = summary.expectedMovementPct > 0 ? ArrowUpRight : summary.expectedMovementPct < 0 ? ArrowDownRight : Minus;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Tile
        label="Current index"
        info="index"
        value={formatIndex(summary.currentIndex)}
        hint="Latest computed national index"
      />
      <Tile
        label={`${summary.horizonDays}-day forecast`}
        info="forecast"
        value={formatIndex(summary.forecastIndex)}
        hint={`${summary.modelVersion} · generated ${new Date(summary.generatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })}`}
        accent
      />
      <Tile
        label="Expected movement"
        info="expected-movement"
        value={formatPct(summary.expectedMovementPct)}
        hint="Median projected change over horizon"
        icon={<Icon className="h-3.5 w-3.5" />}
        tone={summary.expectedMovementPct > 0 ? "danger" : "success"}
      />
      <Tile
        label="Confidence"
        info="confidence"
        value={`${summary.confidencePct}%`}
        hint={summary.confidencePct >= 80 ? "High — suitable for CPI briefing" : summary.confidencePct >= 65 ? "Medium — advisory use" : "Low — monitor only"}
        tone="neutral"
      />
    </div>
  );
}

function Tile({
  label,
  info,
  value,
  hint,
  icon,
  accent,
  tone = "neutral",
}: {
  label: string;
  info?: string;
  value: string;
  hint: string;
  icon?: React.ReactNode;
  accent?: boolean;
  tone?: "neutral" | "danger" | "success";
}) {
  return (
    <div className={cn("rounded-lg border bg-card p-4 shadow-panel", accent ? "border-primary/35 panel-glow" : "border-border")}>
      <p className="label-xs">{info ? <Term t={info as GlossaryKey}>{label}</Term> : label}</p>
      <p
        className={cn(
          "mt-2 flex items-center gap-1 text-[26px] font-semibold leading-none tracking-tight num",
          tone === "danger" && "text-danger",
          tone === "success" && "text-success"
        )}
      >
        {value}
        {icon}
      </p>
      <p className="mt-1.5 truncate text-[10px] text-muted-foreground">{hint}</p>
    </div>
  );
}
