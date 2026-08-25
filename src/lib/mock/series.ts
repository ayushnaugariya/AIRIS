import type { ChartAnnotation, IndexPoint, SeriesResponse } from "@/types";
import { rngFor } from "./routes-data";

function dayISO(offsetDays: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

const HISTORY_DAYS = 90;
const FORECAST_DAYS = 14;
const TOTAL_SLOTS = HISTORY_DAYS + FORECAST_DAYS;

/**
 * Generates a national/regional index series: 90 days of history,
 * previous-period ghost series, 7-day moving average, and a 14-day
 * forecast with a widening confidence band.
 *
 * Deterministic per seed. The series is normalized so the latest actual
 * value equals `target` — keeping every surface of the demo consistent.
 */
export function generateSeries(seed: string, target = 128.6): SeriesResponse {
  const rng = rngFor(seed);

  // Random walk with macro trend, seasonality and weekly rhythm.
  const raw: number[] = [];
  let v = target - 3.8;
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    const t = i / TOTAL_SLOTS;
    v += 0.052 + Math.sin(t * Math.PI * 2.4) * 0.085 + (rng() - 0.5) * 0.6;
    raw.push(v);
  }

  // Normalize so the last historical slot hits the target exactly.
  const lastHistRaw = raw[HISTORY_DAYS - 1];
  const k = target / lastHistRaw;
  for (let i = 0; i < TOTAL_SLOTS; i++) raw[i] *= k;

  const fuelDay = -52;
  const holidayDay = -34;
  const capacityDay = -13;

  const points: IndexPoint[] = [];
  const maWindow: number[] = [];

  for (let i = 0; i < TOTAL_SLOTS; i++) {
    const off = i - (HISTORY_DAYS - 1);
    const date = dayISO(off);

    let value: number | null = null;
    let movingAvg: number | null = null;
    let previous: number | null = null;

    const isHistory = i < HISTORY_DAYS; // off <= 0
    if (isHistory) {
      let val = raw[i];
      if (off >= fuelDay && off <= fuelDay + 6) val += (7 - (off - fuelDay)) * 0.55;
      if (off >= holidayDay && off <= holidayDay + 8) val += (9 - (off - holidayDay)) * 0.45;
      if (off >= capacityDay) val += 1.9 + (rng() - 0.5) * 0.35;
      val += (rng() - 0.5) * 0.42;
      value = Math.round(val * 10) / 10;
      maWindow.push(value);
      if (maWindow.length > 7) maWindow.shift();
      movingAvg =
        maWindow.length >= 4 ? Math.round((maWindow.reduce((a, b) => a + b, 0) / maWindow.length) * 10) / 10 : null;
      previous = Math.round(raw[i] * 0.951 * 10) / 10;
    }

    let forecast: number | null = null;
    let fcLower: number | null = null;
    let fcUpper: number | null = null;
    if (!isHistory) {
      const step = off;
      const mid = raw[HISTORY_DAYS - 1] + step * 0.24;
      const spread = 0.5 + step * 0.17;
      forecast = Math.round(mid * 10) / 10;
      fcLower = Math.round((mid - spread) * 10) / 10;
      fcUpper = Math.round((mid + spread) * 10) / 10;
    }

    points.push({ date, value, movingAvg, previous, forecast, fcLower, fcUpper });
  }

  const annotations: ChartAnnotation[] = [
    {
      id: "evt-fuel",
      date: dayISO(fuelDay),
      label: "Fuel price pressure",
      description: "ATF revision passed through by three carriers within 72 hours.",
      kind: "fuel",
    },
    {
      id: "evt-holiday",
      date: dayISO(holidayDay),
      label: "Holiday demand",
      description: "Long-weekend leisure demand lifted load factors above 91% on western sectors.",
      kind: "demand",
    },
    {
      id: "evt-capacity",
      date: dayISO(capacityDay),
      label: "Capacity reduction",
      description: "Scheduled departures down 6.2% week-over-week on trunk routes.",
      kind: "capacity",
    },
  ];

  return {
    points,
    annotations,
    lastValue: points[HISTORY_DAYS - 1]?.value ?? target,
  };
}
