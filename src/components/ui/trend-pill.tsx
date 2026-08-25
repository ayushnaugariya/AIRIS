import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPct } from "@/lib/format";

interface TrendPillProps {
  value: number | null | undefined;
  /** When true, a rising value is negative news (e.g. fares under pressure). */
  invert?: boolean;
  size?: "sm" | "xs";
  suffix?: string;
  className?: string;
}

/** Signed percentage change indicator — teal up / red down by default. */
export function TrendPill({ value, invert = false, size = "sm", suffix, className }: TrendPillProps) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return <span className={cn("text-xs text-muted-foreground num", className)}>&mdash;</span>;
  }
  const positive = value > 0.05;
  const negative = value < -0.05;
  const good = invert ? negative : positive;
  const Icon = positive ? ArrowUpRight : negative ? ArrowDownRight : Minus;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded px-1 py-0.5 font-semibold num",
        size === "xs" ? "text-[10px]" : "text-[11px]",
        good ? "bg-success/10 text-success" : value === 0 ? "text-muted-foreground" : "bg-danger/10 text-danger",
        className
      )}
    >
      <Icon className={size === "xs" ? "h-3 w-3" : "h-3.5 w-3.5"} strokeWidth={2.5} />
      {formatPct(value)}
      {suffix ? <span className="font-normal text-muted-foreground">{suffix}</span> : null}
    </span>
  );
}
