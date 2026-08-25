import { cn } from "@/lib/utils";
import type { HealthState, PressureLevel, Severity } from "@/types";

type BadgeKind = "pressure" | "severity" | "health" | "connection";

interface Tone {
  label: string;
  className: string;
  dot: string;
  pulse?: boolean;
}

const PRESSURE_TONES: Record<string, Tone> = {
  low: { label: "LOW", className: "border-success/25 bg-success/10 text-success", dot: "bg-success" },
  moderate: { label: "MODERATE", className: "border-accent/25 bg-accent/10 text-accent", dot: "bg-accent" },
  elevated: { label: "ELEVATED", className: "border-warning/30 bg-warning/10 text-warning", dot: "bg-warning" },
  high: { label: "HIGH", className: "border-danger/30 bg-danger/10 text-danger", dot: "bg-danger", pulse: true },
};

const SEVERITY_TONES: Record<string, Tone> = {
  critical: { label: "CRITICAL", className: "border-danger/35 bg-danger/15 text-danger", dot: "bg-danger", pulse: true },
  high: { label: "HIGH", className: "border-warning/30 bg-warning/10 text-warning", dot: "bg-warning" },
  moderate: { label: "MODERATE", className: "border-accent/25 bg-accent/10 text-accent", dot: "bg-accent" },
  low: { label: "LOW", className: "border-border bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
};

const HEALTH_TONES: Record<string, Tone> = {
  healthy: { label: "HEALTHY", className: "border-success/25 bg-success/10 text-success", dot: "bg-success" },
  degraded: { label: "DEGRADED", className: "border-warning/30 bg-warning/10 text-warning", dot: "bg-warning" },
  down: { label: "DOWN", className: "border-danger/30 bg-danger/10 text-danger", dot: "bg-danger", pulse: true },
};

const CONNECTION_TONES: Record<string, Tone> = {
  connected: { label: "LIVE", className: "border-success/25 bg-success/10 text-success", dot: "bg-success", pulse: true },
  connecting: { label: "CONNECTING", className: "border-warning/30 bg-warning/10 text-warning", dot: "bg-warning", pulse: true },
  down: { label: "OFFLINE", className: "border-border bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
};

export interface StatusBadgeProps {
  level?: PressureLevel | Severity | HealthState | "connected" | "connecting";
  kind?: BadgeKind;
  labelOverride?: string;
  size?: "sm" | "md";
  className?: string;
}

/** Unified semantic badge for pressure / severity / health / connection states. */
export function StatusBadge({ level, kind = "pressure", labelOverride, size = "md", className }: StatusBadgeProps) {
  const map =
    kind === "severity"
      ? SEVERITY_TONES
      : kind === "health"
        ? HEALTH_TONES
        : kind === "connection"
          ? CONNECTION_TONES
          : PRESSURE_TONES;
  const tone = map[level ?? "moderate"] ?? map.moderate;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border font-semibold uppercase tracking-[0.06em]",
        size === "sm" ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]",
        tone.className,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot, tone.pulse && "animate-pulse-dot")} />
      {labelOverride ?? tone.label}
    </span>
  );
}
