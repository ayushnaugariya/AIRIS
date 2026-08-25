import type {
  AirlineIndex,
  Anomaly,
  AnomalyStats,
  BookingWindowBucket,
  ComparableFare,
  ConfidenceDistribution,
  FareComponent,
  FareObservation,
  FareQualityScore,
  FareTrendPoint,
  ForecastSummary,
  IndexSummary,
  MarketCorrelationStat,
  PipelineStage,
  PricePressureEntry,
  RegionIndex,
  RegionIndex as RI,
  RouteForecast,
  RouteInsight,
  SeriesResponse,
  SourceCategoryStats,
  SystemStatus,
} from "@/types";
import { ROUTES, rngFor } from "./routes-data";
import { generateSeries } from "./series";

/* ------------------------------- Index domain ------------------------------ */

const INDEX_SUMMARY: IndexSummary = {
  currentIndex: 128.6,
  previousPeriodIndex: 122.7,
  changePct: 4.8,
  momPct: 4.8,
  yoyPct: 11.2,
  pressureLevel: "high",
  pressureChangePct: 7.2,
  routesMonitored: 2846,
  newRoutesThisWeek: 124,
  anomaliesDetected: 37,
  anomaliesCritical: 8,
  forecastSignal: "rising",
  forecastHorizonLabel: "Next 7 days",
  updatedAt: new Date().toISOString(),
};

export const mockGetIndexSummary = async (): Promise<IndexSummary> => ({
  ...INDEX_SUMMARY,
  updatedAt: new Date().toISOString(),
});

export const mockGetSeries = async (seed = "national", target?: number): Promise<SeriesResponse> =>
  generateSeries(seed, target);

export const mockGetRegionalIndices = async (): Promise<RegionIndex[]> => [
  { region: "North", index: 132.4, changePct: 6.8, pressureLevel: "high", trend: [126.2, 127.1, 128.0, 129.4, 130.2, 131.5, 132.4] },
  { region: "West", index: 129.8, changePct: 5.2, pressureLevel: "high", trend: [124.0, 125.2, 125.9, 127.3, 128.4, 129.1, 129.8] },
  { region: "South", index: 124.1, changePct: 2.1, pressureLevel: "moderate", trend: [121.6, 122.0, 122.8, 123.1, 123.5, 123.8, 124.1] },
  { region: "East", index: 121.6, changePct: 3.4, pressureLevel: "moderate", trend: [117.8, 118.4, 119.1, 120.2, 120.8, 121.2, 121.6] },
  { region: "Central", index: 122.7, changePct: 2.6, pressureLevel: "elevated", trend: [119.5, 119.9, 120.6, 121.2, 121.9, 122.3, 122.7] },
  { region: "Northeast", index: 117.5, changePct: 0.8, pressureLevel: "low", trend: [116.4, 116.6, 116.8, 117.0, 117.2, 117.4, 117.5] },
];

export const AIRLINE_INDICES: AirlineIndex[] = [
  { code: "6E", name: "IndiGo", color: "#2563EB", marketSharePct: 60.2, index: 126.9, change7dPct: 3.8, change30dPct: 7.4, onTimePct: 84.6, pressureLevel: "elevated", trend: [122.1, 122.9, 123.6, 124.8, 125.5, 126.2, 126.9] },
  { code: "AI", name: "Air India", color: "#38BDF8", marketSharePct: 14.1, index: 131.2, change7dPct: 6.4, change30dPct: 10.8, onTimePct: 78.2, pressureLevel: "high", trend: [123.4, 124.8, 126.1, 127.9, 129.2, 130.4, 131.2] },
  { code: "UK", name: "Vistara", color: "#14B8A6", marketSharePct: 8.3, index: 133.7, change7dPct: 5.1, change30dPct: 9.2, onTimePct: 82.9, pressureLevel: "high", trend: [127.2, 128.4, 129.6, 130.8, 131.9, 132.8, 133.7] },
  { code: "QP", name: "Akasa Air", color: "#F59E0B", marketSharePct: 4.6, index: 122.9, change7dPct: 2.7, change30dPct: 5.6, onTimePct: 86.1, pressureLevel: "moderate", trend: [119.4, 120.1, 120.8, 121.5, 122.1, 122.5, 122.9] },
  { code: "SG", name: "SpiceJet", color: "#EF4444", marketSharePct: 5.4, index: 118.4, change7dPct: -1.2, change30dPct: 1.9, onTimePct: 71.4, pressureLevel: "low", trend: [120.2, 119.9, 119.6, 119.1, 118.8, 118.6, 118.4] },
  { code: "I5", name: "Air India Express", color: "#A78BFA", marketSharePct: 4.2, index: 125.3, change7dPct: 3.1, change30dPct: 6.2, onTimePct: 81.7, pressureLevel: "moderate", trend: [121.4, 122.0, 122.8, 123.5, 124.2, 124.8, 125.3] },
];

export const mockGetAirlineIndices = async (): Promise<AirlineIndex[]> => AIRLINE_INDICES;

export const MARKET_STATS: MarketCorrelationStat[] = [
  { label: "ATF correlation", value: "0.82", detail: "90-day Pearson r vs aviation turbine fuel spot" },
  { label: "Load factor", value: "84.2%", detail: "Network-wide, trailing 7 days" },
  { label: "Capacity ASK YoY", value: "+6.1%", detail: "Available seat kilometres, year over year" },
  { label: "Fare elasticity", value: "−0.87", detail: "Estimated demand elasticity on trunk routes" },
];

export const mockGetMarketStats = async (): Promise<MarketCorrelationStat[]> => MARKET_STATS;

/* ------------------------------- Route domain ------------------------------ */

export const mockGetRoutes = async (): Promise<RouteInsight[]> => [...ROUTES].sort((a, b) => b.pressureScore - a.pressureScore);

export function buildFareTrend(routeId: string): FareTrendPoint[] {
  const route = ROUTES.find((r) => r.id === routeId) ?? ROUTES[0];
  const rng = rngFor(`${routeId}-trend`);
  const pts: FareTrendPoint[] = [];
  let v = route.avgFare90d;
  for (let i = 44; i >= 0; i--) {
    v += (rng() - 0.48) * route.currentFare * 0.02;
    // converge to current fare at the end
    const pull = (route.currentFare - v) * 0.08;
    const avg = Math.round(v + pull);
    pts.push({
      date: (() => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().slice(0, 10);
      })(),
      avgFare: i === 0 ? route.currentFare : avg,
      lowestFare: Math.round(avg * 0.78),
      highestFare: Math.round(avg * 1.31),
      movingAvg: null,
    });
  }
  // moving average
  for (let i = 0; i < pts.length; i++) {
    if (i < 3) continue;
    const w = pts.slice(i - 3, i + 1).map((p) => p.avgFare ?? 0);
    pts[i].movingAvg = Math.round(w.reduce((a, b) => a + b, 0) / w.length);
  }
  return pts;
}

export const BOOKING_WINDOW: BookingWindowBucket[] = [
  { bucket: "0–1 days", avgFare: 11480, sampleCount: 4120 },
  { bucket: "2–3 days", avgFare: 9260, sampleCount: 8940 },
  { bucket: "4–7 days", avgFare: 7890, sampleCount: 15230 },
  { bucket: "8–14 days", avgFare: 6842, sampleCount: 21840 },
  { bucket: "15–30 days", avgFare: 5976, sampleCount: 26110 },
  { bucket: "30+ days", avgFare: 5431, sampleCount: 19870 },
];

export const FARE_COMPOSITION: FareComponent[] = [
  { component: "Base fare", amount: 3120, pct: 45.6, color: "#2563EB" },
  { component: "Taxes (UDF · PSF · GST)", amount: 2204, pct: 32.2, color: "#38BDF8" },
  { component: "Fees & surcharges", amount: 618, pct: 9.0, color: "#94A3B8" },
  { component: "Baggage", amount: 420, pct: 6.1, color: "#14B8A6" },
  { component: "Other adjustments", amount: 480, pct: 7.1, color: "#F59E0B" },
];

export const COMPARABLE_FARES: ComparableFare[] = [
  { product: "Standard Economy", cabin: "Economy", baggageKg: 15, refundable: false, stops: "non-stop", fare: 6842, note: "Most common observed product — index baseline." },
  { product: "Flex Economy", cabin: "Economy", baggageKg: 25, refundable: true, stops: "non-stop", fare: 8290, note: "+21% premium for flexibility and extra baggage." },
  { product: "Business", cabin: "Business", baggageKg: 35, refundable: true, stops: "non-stop", fare: 18420, note: "Separate cabin class — excluded from economy index." },
];

/* ------------------------------ Anomaly domain ----------------------------- */

interface AnomalySpec {
  id: string;
  time: string;
  day: "Today" | "Yesterday";
  route: [string, string];
  expected: number;
  actual: number;
  severity: Anomaly["severity"];
  confidence: number;
  explanation: string;
  contributors: { factor: string; impactPct: number; detail: string }[];
}

const ANOMALY_SPECS: AnomalySpec[] = [
  {
    id: "ANM-2481",
    time: "14:32",
    day: "Today",
    route: ["DEL", "BOM"],
    expected: 3.1,
    actual: 14.8,
    severity: "critical",
    confidence: 87,
    explanation:
      "Observed index movement exceeds the model's expected band by a wide margin. Capacity cuts combined with sustained booking velocity point to a supply-side shock rather than demand noise.",
    contributors: [
      { factor: "Capacity reduction", impactPct: 46, detail: "Daily departures down from 42 to 34 on this sector since Monday." },
      { factor: "High booking velocity", impactPct: 31, detail: "Bookings/day up 62% against the 30-day baseline." },
      { factor: "Holiday demand", impactPct: 23, detail: "Long-weekend leisure travel window on western trunk routes." },
    ],
  },
  {
    id: "ANM-2480",
    time: "12:05",
    day: "Today",
    route: ["BOM", "GOI"],
    expected: 2.4,
    actual: 9.6,
    severity: "high",
    confidence: 78,
    explanation:
      "Tourism-driven surge into Goa ahead of the long weekend; fares repricing faster than seasonal norms.",
    contributors: [
      { factor: "Seasonal tourism surge", impactPct: 54, detail: "Search-to-book conversion up sharply for leisure destinations." },
      { factor: "Limited remaining inventory", impactPct: 28, detail: "Lowest three fare buckets sold out on 4 of 6 carriers." },
      { factor: "Event demand", impactPct: 18, detail: "Sunburn festival calendar overlap." },
    ],
  },
  {
    id: "ANM-2479",
    time: "09:47",
    day: "Today",
    route: ["DEL", "SXR"],
    expected: 4.0,
    actual: 11.2,
    severity: "high",
    confidence: 81,
    explanation:
      "Srinagar sector repricing well above the seasonal curve as summer holiday bookings peak.",
    contributors: [
      { factor: "Seasonal demand peak", impactPct: 58, detail: "Pilgrimage + holiday season overlap on the northern corridor." },
      { factor: "Weather window", impactPct: 24, detail: "Clear-weather booking spike after last week's disruptions." },
      { factor: "Fuel pass-through", impactPct: 18, detail: "Residual ATF adjustment still flowing through fare builds." },
    ],
  },
  {
    id: "ANM-2478",
    time: "08:15",
    day: "Today",
    route: ["CCU", "DEL"],
    expected: 3.6,
    actual: 8.4,
    severity: "moderate",
    confidence: 76,
    explanation:
      "Moderate deviation driven by ATC flow restrictions at Kolkata reducing effective capacity this morning.",
    contributors: [
      { factor: "ATC flow restrictions", impactPct: 49, detail: "Average delay +38 min; two morning rotations cancelled." },
      { factor: "Business-day demand", impactPct: 33, detail: "Mid-week corporate booking concentration." },
      { factor: "Competitive withdrawal", impactPct: 18, detail: "One carrier reduced frequency on this sector." },
    ],
  },
  {
    id: "ANM-2477",
    time: "06:03",
    day: "Today",
    route: ["BLR", "HYD"],
    expected: 2.9,
    actual: 6.8,
    severity: "moderate",
    confidence: 74,
    explanation:
      "Short-haul sector showing early signs of weekend pricing ramp; within watchlist thresholds but accelerating.",
    contributors: [
      { factor: "Booking velocity", impactPct: 44, detail: "Advance purchases shifting closer to departure." },
      { factor: "Weekend demand", impactPct: 36, detail: "Friday/Sunday load factors trending to 92%." },
      { factor: "Fuel cost drift", impactPct: 20, detail: "Minor ATF-linked adjustment across carriers." },
    ],
  },
  {
    id: "ANM-2476",
    time: "21:48",
    day: "Yesterday",
    route: ["MAA", "DEL"],
    expected: 3.2,
    actual: 9.1,
    severity: "high",
    confidence: 79,
    explanation:
      "Chennai–Delhi evening departures repriced upward following capacity reallocation to international sectors.",
    contributors: [
      { factor: "Capacity reallocation", impactPct: 51, detail: "Two widebody rotations shifted to Gulf sectors." },
      { factor: "Corporate demand", impactPct: 29, detail: "Quarter-end travel approvals concentrated this week." },
      { factor: "Inventory management", impactPct: 20, detail: "Aggressive closure of lower fare buckets." },
    ],
  },
  {
    id: "ANM-2475",
    time: "17:22",
    day: "Yesterday",
    route: ["GAU", "DEL"],
    expected: 2.6,
    actual: 5.9,
    severity: "moderate",
    confidence: 72,
    explanation:
      "Guwahati sector drifting above expected band on regional demand strength; monitored, not actioned.",
    contributors: [
      { factor: "Regional demand growth", impactPct: 47, detail: "Northeast traffic up 11% MoM." },
      { factor: "Limited competition", impactPct: 35, detail: "Only three active operators on non-stop sector." },
      { factor: "Fuel cost drift", impactPct: 18, detail: "Marginal pass-through." },
    ],
  },
  {
    id: "ANM-2474",
    time: "13:10",
    day: "Yesterday",
    route: ["PNQ", "BLR"],
    expected: 2.1,
    actual: -4.2,
    severity: "moderate",
    confidence: 69,
    explanation:
      "Downward anomaly — a carrier launched a short-lived promotional fare bucket, pulling observed fares below expected levels.",
    contributors: [
      { factor: "Promotional pricing", impactPct: 63, detail: "Flash sale seats detected on 2 daily rotations." },
      { factor: "Off-peak timing", impactPct: 24, detail: "Midday slot historically weakest demand." },
      { factor: "Competitive response", impactPct: 13, detail: "Rival matched promo for 12 hours." },
    ],
  },
];

function specToAnomaly(spec: AnomalySpec): Anomaly {
  const ts =
    spec.day === "Today"
      ? new Date(Date.now())
      : new Date(Date.now() - 86_400_000);
  const route = ROUTES.find((r) => r.id === `${spec.route[0]}-${spec.route[1]}`);
  return {
    id: spec.id,
    detectedAt: ts.toISOString(),
    timeLabel: spec.time,
    dayLabel: spec.day,
    routeId: `${spec.route[0]}-${spec.route[1]}`,
    routeLabel: `${spec.route[0]} → ${spec.route[1]}`,
    indexChangePct: Math.round((spec.actual - spec.expected) * 10) / 10,
    expectedPct: spec.expected,
    actualPct: spec.actual,
    deviationPp: Math.round((spec.actual - spec.expected) * 10) / 10,
    severity: spec.severity,
    status: "open",
    explanation: spec.explanation,
    contributors: spec.contributors,
    confidencePct: spec.confidence,
    fareMoveINR: Math.round((spec.actual / 100) * 6842),
    flightsInScope: (route?.flights ?? []).map((f) => f.flightNo).slice(0, 3),
  };
}

export const ANOMALIES: Anomaly[] = ANOMALY_SPECS.map(specToAnomaly);

export const mockGetAnomalies = async (): Promise<Anomaly[]> => ANOMALIES;

export const mockGetAnomalyStats = async (): Promise<AnomalyStats> => ({
  total: 37,
  critical: 8,
  high: 11,
  moderate: 18,
  low: 0,
  resolutionRatePct: 91.4,
});

/* ------------------------------ Forecast domain ---------------------------- */

export function mockGetForecastSummary(horizon: 7 | 14 | 30): Promise<ForecastSummary> {
  const table = {
    7: { idx: 131.9, move: 2.6, conf: 84 },
    14: { idx: 134.2, move: 4.4, conf: 76 },
    30: { idx: 137.8, move: 7.2, conf: 64 },
  } as const;
  const t = table[horizon];
  return Promise.resolve({
    horizonDays: horizon,
    currentIndex: 128.6,
    forecastIndex: t.idx,
    expectedMovementPct: t.move,
    confidencePct: t.conf,
    signal: "rising",
    generatedAt: new Date().toISOString(),
    modelVersion: "airis-fx 2.4.1",
  });
}

export const ROUTE_FORECASTS: RouteForecast[] = [
  { routeId: "DEL-BOM", routeLabel: "DEL → BOM", expectedChangePct: 8.4, confidencePct: 87, signal: "rising" },
  { routeId: "BOM-DEL", routeLabel: "BOM → DEL", expectedChangePct: 7.9, confidencePct: 85, signal: "rising" },
  { routeId: "DEL-BLR", routeLabel: "DEL → BLR", expectedChangePct: 6.2, confidencePct: 83, signal: "rising" },
  { routeId: "BOM-GOI", routeLabel: "BOM → GOI", expectedChangePct: 9.1, confidencePct: 71, signal: "rising" },
  { routeId: "MAA-DEL", routeLabel: "MAA → DEL", expectedChangePct: 5.4, confidencePct: 82, signal: "rising" },
  { routeId: "DEL-SXR", routeLabel: "DEL → SXR", expectedChangePct: 6.8, confidencePct: 74, signal: "rising" },
];

export const mockGetRouteForecasts = async (): Promise<RouteForecast[]> => ROUTE_FORECASTS;

export const CONFIDENCE_DISTRIBUTION: ConfidenceDistribution[] = [
  { level: "High", routeCount: 1642, description: "Confidence ≥ 80% · stable drivers, dense observations" },
  { level: "Medium", routeCount: 877, description: "65–79% · moderate volatility or thinner history" },
  { level: "Low", routeCount: 327, description: "< 65% · sparse data, event-driven distortion likely" },
];

/* ------------------------------- Fares / quality --------------------------- */

/** Route-aware comparability score — deterministic per sector. */
export function buildFareQuality(routeId: string): FareQualityScore {
  const route = ROUTES.find((r) => r.id === routeId) ?? ROUTES[0];
  const rng = rngFor(`${routeId}-quality`);
  const score = 88 + Math.floor(rng() * 8); // 88–95
  return {
    routeId: route.id,
    score,
    maxScore: 100,
    grade: score >= 93 ? "A" : "B+",
    observationsCount: 9,
    medianFare: route.currentFare,
    verifiedPct: 88.9,
    quarantineCount: 2,
    dimensions: [
      { key: "taxes", label: "Taxes included", passed: true, detail: "All-inclusive totals; no stripped-down base fares in scope." },
      { key: "baggage", label: "Baggage normalized", passed: true, detail: "Fares adjusted to a 15 kg checked + 7 kg cabin standard." },
      { key: "cabin", label: "Cabin matched", passed: true, detail: "Economy observations only; business/premium separated." },
      { key: "cancellation", label: "Cancellation normalized", passed: true, detail: "Non-refundable equivalence applied before aggregation." },
      { key: "stops", label: "Direct/connecting matched", passed: true, detail: "Itineraries grouped by stop count; non-stop is baseline." },
      { key: "window", label: "Booking window matched", passed: true, detail: "Compared within identical advance-purchase bands." },
      { key: "source", label: "Source verified", passed: true, detail: "Cross-validated against a second independent capture." },
      { key: "markup", label: "OTA markup variance", passed: false, advisory: true, detail: "Convenience-fee spread of ±¹⁹⁴ monitored; capped influence in index." },
    ],
  };
}

const OBS_SOURCES = [
  { name: "IndiGo (direct)", airline: "IndiGo" },
  { name: "Air India (direct)", airline: "Air India" },
  { name: "Vistara (direct)", airline: "Vistara" },
  { name: "Akasa (direct)", airline: "Akasa Air" },
  { name: "MakeMyTrip", airline: "IndiGo" },
  { name: "Cleartrip", airline: "Air India Express" },
  { name: "EaseMyTrip", airline: "SpiceJet" },
  { name: "Yatra", airline: "Air India" },
  { name: "Paytm Travel", airline: "Akasa Air" },
] as const;

/** Route-aware observation set — the table on the Fare Quality page. */
export function buildFareObservations(routeId: string): FareObservation[] {
  const route = ROUTES.find((r) => r.id === routeId) ?? ROUTES[0];
  const rng = rngFor(`${routeId}-obs`);
  const ref = route.currentFare;

  return OBS_SOURCES.map((s, i) => {
    const raw = Math.round((ref * (0.9 + rng() * 0.28) * (i > 3 ? 1.03 : 1)) / 2) * 2;
    const taxes = Math.round(raw * (0.3 + rng() * 0.05));
    const total = raw + taxes;
    const baggage = [15, 15, 15, 15, 15, 10, 15, 25, 15][i];
    const refundable = i === 3 || i === 7;
    const connecting = i === 7;
    const flight = route.flights[i % route.flights.length];
    const issues: string[] = [];
    if (i > 3 && i !== 8) issues.push(`OTA convenience fee +₹${Math.round(total * 0.03)}`);
    if (baggage === 10) issues.push("Baggage 10 kg vs 15 kg standard");
    if (refundable) issues.push("Refundable product — adjusted");
    if (connecting) issues.push("Connecting itinerary");
    const normalized = Math.round((total - (refundable ? total * 0.09 : 0) - (baggage === 10 ? 210 : 0) - (i > 3 && i !== 8 ? total * 0.03 : 0)) / 2) * 2;
    return {
      id: `FOB-${route.id}-${900 + i}`,
      source: s.name,
      airline: flight.airline,
      flightNo: flight.flightNo,
      depTime: flight.depTime,
      arrTime: flight.arrTime,
      cabin: "Economy",
      baggageKg: baggage,
      cancellation: refundable ? "Refundable" : "Non-refundable",
      stops: connecting ? "1 stop" : "non-stop",
      bookingWindowDays: 11,
      baseFare: raw - taxes,
      taxesFees: taxes,
      totalFare: total,
      normalizedFare: normalized,
      capturedAt: new Date(Date.now() - (90 + i * 13) * 1000).toISOString(),
      verified: i !== 3,
      issues,
    } satisfies FareObservation;
  });
}

export const FARE_QUALITY_SCORE: FareQualityScore = buildFareQuality("DEL-BOM");

export const FARE_OBSERVATIONS: FareObservation[] = buildFareObservations("DEL-BOM");

/* ------------------------------- Pressure model ---------------------------- */

export const PRICE_PRESSURE: PricePressureEntry[] = [
  { rank: 1, routeId: "DEL-BOM", routeLabel: "DEL → BOM", pressureLevel: "high", pressureScore: 92, change7dPct: 12.4, primaryDriver: "Capacity reduction" },
  { rank: 2, routeId: "BOM-BLR", routeLabel: "BOM → BLR", pressureLevel: "high", pressureScore: 84, change7dPct: 10.1, primaryDriver: "Booking velocity" },
  { rank: 3, routeId: "DEL-BLR", routeLabel: "DEL → BLR", pressureLevel: "elevated", pressureScore: 79, change7dPct: 8.8, primaryDriver: "Holiday demand" },
  { rank: 4, routeId: "DEL-HYD", routeLabel: "DEL → HYD", pressureLevel: "elevated", pressureScore: 74, change7dPct: 7.6, primaryDriver: "Historical deviation" },
  { rank: 5, routeId: "DEL-SXR", routeLabel: "DEL → SXR", pressureLevel: "elevated", pressureScore: 72, change7dPct: 7.2, primaryDriver: "Seasonal tourism" },
  { rank: 6, routeId: "BOM-GOI", routeLabel: "BOM → GOI", pressureLevel: "elevated", pressureScore: 69, change7dPct: 8.1, primaryDriver: "Event demand" },
  { rank: 7, routeId: "MAA-DEL", routeLabel: "MAA → DEL", pressureLevel: "elevated", pressureScore: 71, change7dPct: 6.9, primaryDriver: "Capacity reallocation" },
  { rank: 8, routeId: "DEL-CCU", routeLabel: "DEL → CCU", pressureLevel: "moderate", pressureScore: 66, change7dPct: 5.2, primaryDriver: "Booking velocity" },
  { rank: 9, routeId: "GAU-DEL", routeLabel: "GAU → DEL", pressureLevel: "moderate", pressureScore: 63, change7dPct: 4.9, primaryDriver: "Regional demand" },
  { rank: 10, routeId: "BLR-PNQ", routeLabel: "BLR → PNQ", pressureLevel: "moderate", pressureScore: 57, change7dPct: 3.9, primaryDriver: "Weekend ramp" },
];

export const PRESSURE_MODEL_FACTORS = [
  "Recent price movement",
  "Historical deviation",
  "Booking velocity",
  "Route demand",
  "Anomaly signals",
];

/* ------------------------------ Sources & system --------------------------- */

export interface DataSourceRecord {
  id: string;
  name: string;
  url: string;
  category: "airline" | "ota";
  status: "connected" | "degraded" | "down";
  lastIngestionMinutesAgo: number;
  recordsToday: number;
  dataQualityPct: number;
  latencyMs: number;
}

export const DATA_SOURCES: DataSourceRecord[] = [
  { id: "src-indigo", name: "IndiGo", url: "goindigo.in", category: "airline", status: "connected", lastIngestionMinutesAgo: 2, recordsToday: 61203, dataQualityPct: 99.1, latencyMs: 240 },
  { id: "src-airindia", name: "Air India", url: "airindia.com", category: "airline", status: "connected", lastIngestionMinutesAgo: 3, recordsToday: 38412, dataQualityPct: 98.6, latencyMs: 310 },
  { id: "src-spicejet", name: "SpiceJet", url: "spicejet.com", category: "airline", status: "degraded", lastIngestionMinutesAgo: 14, recordsToday: 9842, dataQualityPct: 96.2, latencyMs: 1240 },
  { id: "src-akasa", name: "Akasa Air", url: "akasaair.com", category: "airline", status: "connected", lastIngestionMinutesAgo: 4, recordsToday: 12118, dataQualityPct: 98.9, latencyMs: 280 },
  { id: "src-mmt", name: "MakeMyTrip", url: "makemytrip.com", category: "ota", status: "connected", lastIngestionMinutesAgo: 2, recordsToday: 64207, dataQualityPct: 98.4, latencyMs: 350 },
  { id: "src-cleartrip", name: "Cleartrip", url: "cleartrip.com", category: "ota", status: "connected", lastIngestionMinutesAgo: 5, recordsToday: 22340, dataQualityPct: 97.8, latencyMs: 410 },
  { id: "src-easemytrip", name: "EaseMyTrip", url: "easemytrip.com", category: "ota", status: "connected", lastIngestionMinutesAgo: 3, recordsToday: 27511, dataQualityPct: 98.1, latencyMs: 380 },
  { id: "src-yatra", name: "Yatra", url: "yatra.com", category: "ota", status: "connected", lastIngestionMinutesAgo: 7, recordsToday: 11258, dataQualityPct: 97.2, latencyMs: 460 },
];

export function sourceCategoryStats(category: "airline" | "ota"): SourceCategoryStats {
  const rows = DATA_SOURCES.filter((s) => s.category === category);
  return {
    category,
    recordsToday: rows.reduce((a, s) => a + s.recordsToday, 0),
    avgQualityPct: Math.round((rows.reduce((a, s) => a + s.dataQualityPct, 0) / rows.length) * 10) / 10,
    connectedCount: rows.filter((s) => s.status === "connected").length,
    totalCount: rows.length,
  };
}

export const PIPELINE_STAGES: PipelineStage[] = [
  { key: "source", label: "Source", description: "Airline & OTA portals scraped headlessly", metric: "8 connectors live", status: "healthy" },
  { key: "ingestion", label: "Ingestion", description: "Raw fare captures queued & timestamped", metric: "3,214 rec/min", status: "healthy" },
  { key: "validation", label: "Validation", description: "Schema, dedupe & outlier screening", metric: "99.2% pass rate", status: "healthy" },
  { key: "normalization", label: "Normalization", description: "Taxes, baggage, cabin, window alignment", metric: "p95 1.2s", status: "healthy" },
  { key: "index", label: "Index Engine", description: "Laspeyres-style chained index computation", metric: "2,846 routes / 15-min cycle", status: "healthy" },
  { key: "ai", label: "AI Analytics", description: "Anomaly detection & forecasting models", metric: "37 signals/hr scored", status: "healthy" },
  { key: "dashboard", label: "Dashboard", description: "REST + WebSocket delivery to clients", metric: "128 msg/min", status: "healthy" },
];

export const SYSTEM_STATUS: SystemStatus = {
  overall: "operational",
  ingestion: "healthy",
  indexEngine: "healthy",
  analytics: "healthy",
  websocket: "connected",
  uptimePct: 99.97,
};

/* Re-export for API + UI convenience */
export { ROUTES, routeById } from "./routes-data";
export type { RI };
export { AIRPORTS } from "./airports";
