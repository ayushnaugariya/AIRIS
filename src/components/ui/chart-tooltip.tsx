"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { formatDateLong } from "@/lib/format";

export interface TooltipEntry {
  name: string;
  value: number | null | undefined;
  color?: string;
  formatter?: (v: number) => string;
}

interface AirisChartTooltipProps {
  active?: boolean;
  label?: string;
  entries?: TooltipEntry[];
  footnote?: string;
}

/** Standard tooltip panel shared by every Recharts surface. */
export function ChartTooltip({ active, label, entries, footnote }: AirisChartTooltipProps) {
  const theme = useTheme().theme;
  if (!active || !entries?.length) return null;
  return (
    <div className="min-w-[190px] rounded-lg border border-border bg-popover/95 px-3 py-2 shadow-raised backdrop-blur-sm">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label ? formatDateLong(label) : ""}
      </p>
      <div className="space-y-1">
        {entries.map((e) => (
          <div key={e.name} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span
                aria-hidden
                className="inline-block h-0.5 w-3.5 rounded-full"
                style={{
                  background:
                    theme === "light"
                      ? e.color ?? "#94A3B8"
                      : `repeating-linear-gradient(90deg, ${e.color ?? "#94A3B8"} 0 4px, ${e.color ?? "#94A3B8"}00 4px 6px)`,
                }}
              />
              {e.name}
            </span>
            <span className="font-semibold num">
              {e.value === null || e.value === undefined
                ? "—"
                : e.formatter
                  ? e.formatter(e.value)
                  : e.value.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
      {footnote ? (
        <p className="mt-1.5 border-t border-border pt-1.5 text-[10px] leading-snug text-muted-foreground">{footnote}</p>
      ) : null}
    </div>
  );
}
