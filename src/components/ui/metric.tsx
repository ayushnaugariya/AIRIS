import { cn } from "@/lib/utils";
import { Term } from "./term";
import type { GlossaryKey } from "@/lib/glossary";

interface MetricProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  info?: string;
  className?: string;
  valueClassName?: string;
}

/** Compact data metric — uppercase micro label + strong tabular value. */
export function Metric({ label, value, hint, info, className, valueClassName }: MetricProps) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className="label-xs">{info ? <Term t={info as GlossaryKey}>{label}</Term> : label}</span>
      <span className={cn("text-sm font-semibold num tracking-tight", valueClassName)}>{value}</span>
      {hint ? <span className="text-[10px] leading-tight text-muted-foreground">{hint}</span> : null}
    </div>
  );
}
