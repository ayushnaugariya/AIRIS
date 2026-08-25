"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TrendPill } from "@/components/ui/trend-pill";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Term } from "@/components/ui/term";
import type { GlossaryKey } from "@/lib/glossary";
import { cn } from "@/lib/utils";

type Tone = "primary" | "accent" | "success" | "warning" | "danger";

const TONE_LINE: Record<Tone, string> = {
  primary: "via-primary/70",
  accent: "via-accent/70",
  success: "via-success/60",
  warning: "via-warning/60",
  danger: "via-danger/60",
};

interface KPICardProps {
  label: string;
  /** Glossary key — renders the label with a hover definition. */
  info?: string;
  value?: number;
  displayValue?: string;
  decimals?: number;
  trend?: { value: number; suffix?: string; invert?: boolean };
  footnote?: React.ReactNode;
  stats?: { label: string; value: string }[];
  icon: LucideIcon;
  tone?: Tone;
  spark?: number[];
  href?: string;
  live?: boolean;
}

/** Compact premium KPI panel — hairline tone accent, no oversized color blocks. */
export function KPICard({
  label,
  info,
  value,
  displayValue,
  decimals = 1,
  trend,
  footnote,
  stats,
  icon: Icon,
  tone = "primary",
  spark,
  href,
  live,
}: KPICardProps) {
  const numberFormat =
    decimals === 0
      ? (v: number) => Math.round(v).toLocaleString("en-IN")
      : (v: number) => v.toFixed(decimals);
  const body = (
    <Card
      className={cn(
        "panel-glow group relative flex h-full flex-col justify-between overflow-hidden p-4 transition-colors duration-200",
        href && "hover:border-primary/40"
      )}
    >
      <span aria-hidden className={cn("pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent", TONE_LINE[tone])} />
      <div className="flex items-start justify-between gap-2">
        <p className="label-xs leading-relaxed">
          {info ? <Term t={info as GlossaryKey}>{label}</Term> : label}
        </p>
        <Icon className={cn("h-4 w-4 shrink-0", live ? "text-success" : "text-muted-foreground")} strokeWidth={1.75} />
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            {displayValue !== undefined ? (
              <span className="text-[26px] font-semibold leading-none tracking-tight num">{displayValue}</span>
            ) : (
              <AnimatedNumber value={value ?? 0} format={numberFormat} className="text-[26px] font-semibold leading-none tracking-tight" />
            )}
            {trend ? <TrendPill value={trend.value} size="xs" invert={trend.invert} /> : null}
          </div>
          {footnote ? <p className="mt-1.5 text-[10px] text-muted-foreground">{footnote}</p> : null}
        </div>
        {spark && spark.length > 1 ? <MiniBars data={spark} tone={tone} /> : null}
      </div>

      {stats?.length ? (
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-2.5">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="label-xs text-[9px]">{s.label}</p>
              <p className="text-[11px] font-semibold num">{s.value}</p>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="h-full"
    >
      {href ? (
        <Link href={href} className="block h-full focus-visible:outline-none">
          {body}
        </Link>
      ) : (
        body
      )}
    </motion.div>
  );
}

function MiniBars({ data, tone }: { data: number[]; tone: Tone }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const barColor =
    tone === "success" ? "bg-success/70" : tone === "warning" ? "bg-warning/70" : tone === "danger" ? "bg-danger/70" : tone === "accent" ? "bg-accent/70" : "bg-primary/70";
  return (
    <div className="flex h-9 items-end gap-[3px]" aria-hidden>
      {data.slice(-12).map((v, i) => (
        <span
          key={i}
          className={cn("w-[4px] rounded-sm", barColor)}
          style={{ height: `${18 + ((v - min) / range) * 82}%` }}
        />
      ))}
    </div>
  );
}
