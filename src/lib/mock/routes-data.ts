import type { FlightDeal, PressureLevel, RouteInsight } from "@/types";
import { airport } from "./airports";

/* Deterministic PRNG so every reload shows identical numbers during the demo. */
export function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rngFor(key: string): () => number {
  return mulberry32(hashSeed(key));
}

interface RouteSpec {
  from: string;
  to: string;
  distanceKm: number;
  baseFare: number; // representative current fare in INR
  pressure: PressureLevel;
  pressureScore: number;
  change7d: number; // signed %
  forecast: "rising" | "falling" | "stable";
}

const SPECS: RouteSpec[] = [
  { from: "DEL", to: "BOM", distanceKm: 1148, baseFare: 6842, pressure: "high", pressureScore: 92, change7d: 12.4, forecast: "rising" },
  { from: "BOM", to: "DEL", distanceKm: 1148, baseFare: 6510, pressure: "high", pressureScore: 88, change7d: 10.8, forecast: "rising" },
  { from: "DEL", to: "BLR", distanceKm: 1740, baseFare: 5928, pressure: "high", pressureScore: 84, change7d: 10.1, forecast: "rising" },
  { from: "BLR", to: "DEL", distanceKm: 1740, baseFare: 5672, pressure: "elevated", pressureScore: 79, change7d: 8.8, forecast: "rising" },
  { from: "BOM", to: "BLR", distanceKm: 844, baseFare: 4895, pressure: "high", pressureScore: 81, change7d: 9.6, forecast: "rising" },
  { from: "DEL", to: "HYD", distanceKm: 1255, baseFare: 5410, pressure: "elevated", pressureScore: 74, change7d: 7.6, forecast: "rising" },
  { from: "MAA", to: "DEL", distanceKm: 1760, baseFare: 7436, pressure: "elevated", pressureScore: 71, change7d: 6.9, forecast: "rising" },
  { from: "DEL", to: "CCU", distanceKm: 1301, baseFare: 6934, pressure: "moderate", pressureScore: 66, change7d: 5.2, forecast: "stable" },
  { from: "BOM", to: "GOI", distanceKm: 442, baseFare: 4128, pressure: "elevated", pressureScore: 69, change7d: 8.1, forecast: "rising" },
  { from: "GOI", to: "BOM", distanceKm: 442, baseFare: 3876, pressure: "moderate", pressureScore: 58, change7d: 4.3, forecast: "stable" },
  { from: "GAU", to: "DEL", distanceKm: 1452, baseFare: 8145, pressure: "moderate", pressureScore: 63, change7d: 4.9, forecast: "stable" },
  { from: "DEL", to: "GAU", distanceKm: 1452, baseFare: 7862, pressure: "moderate", pressureScore: 60, change7d: 4.1, forecast: "stable" },
  { from: "AMD", to: "DEL", distanceKm: 772, baseFare: 3428, pressure: "moderate", pressureScore: 55, change7d: 3.6, forecast: "stable" },
  { from: "PNQ", to: "BLR", distanceKm: 735, baseFare: 3965, pressure: "moderate", pressureScore: 57, change7d: 3.9, forecast: "stable" },
  { from: "HYD", to: "PNQ", distanceKm: 504, baseFare: 3518, pressure: "low", pressureScore: 42, change7d: 1.4, forecast: "stable" },
  { from: "CCU", to: "BBI", distanceKm: 368, baseFare: 2984, pressure: "low", pressureScore: 38, change7d: -0.8, forecast: "falling" },
  { from: "DEL", to: "JAI", distanceKm: 241, baseFare: 2764, pressure: "low", pressureScore: 35, change7d: -1.6, forecast: "falling" },
  { from: "JAI", to: "AMD", distanceKm: 525, baseFare: 3208, pressure: "low", pressureScore: 40, change7d: 0.9, forecast: "stable" },
  { from: "COK", to: "MAA", distanceKm: 502, baseFare: 3654, pressure: "moderate", pressureScore: 52, change7d: 3.1, forecast: "stable" },
  { from: "TRV", to: "BLR", distanceKm: 531, baseFare: 3792, pressure: "low", pressureScore: 44, change7d: 1.8, forecast: "stable" },
  { from: "IXC", to: "DEL", distanceKm: 240, baseFare: 2894, pressure: "low", pressureScore: 37, change7d: -1.1, forecast: "stable" },
  { from: "DEL", to: "SXR", distanceKm: 650, baseFare: 5948, pressure: "elevated", pressureScore: 72, change7d: 7.2, forecast: "rising" },
  { from: "PAT", to: "DEL", distanceKm: 850, baseFare: 4462, pressure: "moderate", pressureScore: 54, change7d: 3.3, forecast: "stable" },
  { from: "VNS", to: "DEL", distanceKm: 664, baseFare: 3986, pressure: "moderate", pressureScore: 51, change7d: 2.8, forecast: "stable" },
  { from: "IDR", to: "BOM", distanceKm: 512, baseFare: 3648, pressure: "low", pressureScore: 45, change7d: 2.1, forecast: "stable" },
  { from: "LKO", to: "DEL", distanceKm: 420, baseFare: 3326, pressure: "low", pressureScore: 41, change7d: 1.6, forecast: "stable" },
  { from: "BBI", to: "DEL", distanceKm: 1245, baseFare: 5874, pressure: "moderate", pressureScore: 56, change7d: 3.7, forecast: "stable" },
  { from: "MAA", to: "COK", distanceKm: 502, baseFare: 3588, pressure: "low", pressureScore: 43, change7d: 1.2, forecast: "stable" },
  { from: "BLR", to: "PNQ", distanceKm: 735, baseFare: 3842, pressure: "moderate", pressureScore: 53, change7d: 3.0, forecast: "stable" },
  { from: "HYD", to: "MAA", distanceKm: 510, baseFare: 3416, pressure: "low", pressureScore: 39, change7d: 0.4, forecast: "stable" },
  /* ---- expansion wave: +12 sectors ---- */
  { from: "DEL", to: "PNQ", distanceKm: 1170, baseFare: 5980, pressure: "elevated", pressureScore: 73, change7d: 7.0, forecast: "rising" },
  { from: "PNQ", to: "DEL", distanceKm: 1170, baseFare: 5710, pressure: "moderate", pressureScore: 64, change7d: 5.4, forecast: "rising" },
  { from: "BOM", to: "MAA", distanceKm: 1030, baseFare: 5210, pressure: "moderate", pressureScore: 62, change7d: 4.4, forecast: "stable" },
  { from: "MAA", to: "BLR", distanceKm: 290, baseFare: 3180, pressure: "low", pressureScore: 41, change7d: 1.2, forecast: "stable" },
  { from: "BLR", to: "COK", distanceKm: 370, baseFare: 3460, pressure: "moderate", pressureScore: 55, change7d: 3.4, forecast: "stable" },
  { from: "CCU", to: "GAU", distanceKm: 520, baseFare: 3890, pressure: "moderate", pressureScore: 58, change7d: 4.6, forecast: "rising" },
  { from: "PNQ", to: "GOI", distanceKm: 520, baseFare: 4020, pressure: "elevated", pressureScore: 67, change7d: 6.8, forecast: "rising" },
  { from: "AMD", to: "BOM", distanceKm: 440, baseFare: 3350, pressure: "low", pressureScore: 45, change7d: 2.2, forecast: "stable" },
  { from: "IXC", to: "BOM", distanceKm: 1220, baseFare: 5480, pressure: "moderate", pressureScore: 60, change7d: 4.9, forecast: "stable" },
  { from: "LKO", to: "BOM", distanceKm: 1070, baseFare: 4980, pressure: "moderate", pressureScore: 57, change7d: 3.8, forecast: "stable" },
  { from: "PAT", to: "CCU", distanceKm: 480, baseFare: 3590, pressure: "low", pressureScore: 47, change7d: 2.4, forecast: "stable" },
  { from: "VNS", to: "BOM", distanceKm: 940, baseFare: 4520, pressure: "low", pressureScore: 49, change7d: 2.6, forecast: "stable" },
];

function jitter(rng: () => number, spreadPct: number): number {
  return 1 + ((rng() * 2 - 1) * spreadPct) / 100;
}

/* --------------------------- Carriers & fare quotes ------------------------- */

const CARRIERS = [
  { code: "6E", name: "IndiGo", weight: 58, aircraft: ["A320neo", "A321neo", "ATR72-600"] },
  { code: "AI", name: "Air India", weight: 14, aircraft: ["A320neo", "A321neo", "B787-9"] },
  { code: "UK", name: "Vistara", weight: 8, aircraft: ["A320neo", "A321neo", "B787-9"] },
  { code: "QP", name: "Akasa Air", weight: 6, aircraft: ["B737-8"] },
  { code: "SG", name: "SpiceJet", weight: 6, aircraft: ["B737-8", "Q400"] },
  { code: "IX", name: "Air India Express", weight: 5, aircraft: ["B737-8", "A320neo"] },
];

export const QUOTE_SOURCES = ["Airline direct", "MakeMyTrip", "Cleartrip", "EaseMyTrip", "Yatra"] as const;

function pickCarrier(rng: () => number) {
  const total = CARRIERS.reduce((a, c) => a + c.weight, 0);
  let roll = rng() * total;
  for (const c of CARRIERS) {
    roll -= c.weight;
    if (roll <= 0) return c;
  }
  return CARRIERS[0];
}

function minutesToClock(baseMinutes: number): string {
  const m = ((baseMinutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/** 10 scheduled non-stops per sector, each priced on 5 websites. */
function buildFlightDeals(spec: RouteSpec, rng: () => number, referenceFare: number): FlightDeal[] {
  const deals: FlightDeal[] = [];
  const usedFlightNos = new Set<string>();
  const blockMinutes = Math.round(55 + (spec.distanceKm / 800) * 60);

  for (let i = 0; i < 10; i++) {
    const carrier = pickCarrier(rng);
    let flightNo = "";
    do {
      flightNo = `${carrier.code}-${100 + Math.floor(rng() * 8700)}`;
    } while (usedFlightNos.has(flightNo));
    usedFlightNos.add(flightNo);

    const dep = 290 + i * 62 + Math.floor(rng() * 35); // ~04:50 → 21:30 spread
    const arr = dep + blockMinutes;
    const base = Math.round((referenceFare * (0.82 + rng() * 0.52)) / 10) * 10;

    const promoIdx = Math.floor(rng() * QUOTE_SOURCES.length);
    const quotes = QUOTE_SOURCES.map((source, si) => {
      let fare = base;
      if (si > 0) fare = base * (1 + 0.012 + rng() * 0.055); // OTA convenience markup
      if (si === promoIdx && si > 0) fare = base * 0.965; // flash promo on one OTA
      return { source, fare: Math.round(fare / 10) * 10 };
    });

    const best = quotes.reduce((a, q) => (q.fare < a.fare ? q : a), quotes[0]);
    const hrs = Math.floor(blockMinutes / 60);
    const mins = blockMinutes % 60;

    deals.push({
      flightNo,
      airline: carrier.name,
      aircraft: carrier.aircraft[Math.floor(rng() * carrier.aircraft.length)],
      depTime: minutesToClock(dep),
      arrTime: minutesToClock(arr),
      durationLabel: hrs > 0 ? `${hrs}h ${String(mins).padStart(2, "0")}m` : `${mins}m`,
      quotes,
      bestFare: best.fare,
      bestSource: best.source,
    });
  }

  return deals.sort((a, b) => a.depTime.localeCompare(b.depTime));
}

/** All monitored routes with fully resolved insight records. */
export const ROUTES: RouteInsight[] = SPECS.map((spec, i) => {
  const rng = rngFor(`${spec.from}-${spec.to}`);
  const origin = airport(spec.from);
  const destination = airport(spec.to);
  const fare = Math.round((spec.baseFare * jitter(rng, 0.8)) / 2) * 2;
  const avg = Math.round(fare / (1 + spec.change7d / 100 / 2));
  return {
    id: `${spec.from}-${spec.to}`,
    originCode: spec.from,
    destinationCode: spec.to,
    originCity: origin.city,
    destinationCity: destination.city,
    distanceKm: spec.distanceKm,
    currentFare: fare,
    currency: "INR",
    indexValue: Math.round((118 + rng() * 22 + spec.pressureScore / 12) * 10) / 10,
    change7dPct: Math.round(spec.change7d * 10) / 10,
    change30dPct: Math.round((spec.change7d * 1.6 + rng() * 2 - 1) * 10) / 10,
    pressureLevel: spec.pressure,
    pressureScore: Math.min(99, Math.round(spec.pressureScore * jitter(rng, 1.2))),
    forecastSignal: spec.forecast,
    avgFare90d: avg,
    lowestFare90d: Math.round(avg * 0.74),
    highestFare90d: Math.round(avg * (1.35 + rng() * 0.15)),
    bookingVelocityPct: Math.round((18 + rng() * 30 + (spec.pressureScore - 50) * 0.4) * 10) / 10,
    lastUpdated: new Date(Date.now() - (i % 7) * 17_000 - 23_000).toISOString(),
    flights: buildFlightDeals(spec, rng, fare),
  } satisfies RouteInsight;
});

export function routeById(id: string): RouteInsight | undefined {
  return ROUTES.find((r) => r.id === id);
}
