/**
 * Shared chart color tokens.
 * Values are tuned to work on both dark (default) and light themes.
 */

export const CHART = {
  actual: "#2563EB",
  actualFill: "rgba(37,99,235,0.18)",
  movingAvg: "#38BDF8",
  forecast: "#38BDF8",
  forecastBand: "rgba(56,189,248,0.10)",
  previous: "#64748B",
  annotation: "#F59E0B",
  teal: "#14B8A6",
  amber: "#F59E0B",
  red: "#EF4444",
  slate: "#94A3B8",
} as const;

export interface ChartTheme {
  grid: string;
  tick: string;
  axis: string;
}

const DARK: ChartTheme = { grid: "rgba(148,163,184,0.14)", tick: "#8FA3BF", axis: "rgba(148,163,184,0.25)" };
const LIGHT: ChartTheme = { grid: "rgba(100,116,139,0.16)", tick: "#5B6B82", axis: "rgba(100,116,139,0.35)" };

export function chartTheme(theme: "dark" | "light"): ChartTheme {
  return theme === "light" ? LIGHT : DARK;
}

export const REGION_COLORS: Record<string, string> = {
  North: "#2563EB",
  West: "#38BDF8",
  South: "#14B8A6",
  East: "#F59E0B",
  Central: "#A78BFA",
  Northeast: "#F472B6",
};

export const PRESSURE_ARC_COLORS: Record<string, [number, number, number, number]> = {
  low: [56, 189, 248, 90],
  moderate: [56, 189, 248, 140],
  elevated: [245, 158, 11, 190],
  high: [239, 68, 68, 210],
  critical: [239, 68, 68, 230],
};
