/**
 * AIRIS — shared API contracts.
 *
 * These interfaces define the expected FastAPI response shapes. The UI only
 * consumes these types; `src/lib/api/*` resolves them from either the REST
 * backend or the mock services in `src/lib/mock`.
 */

/* ---------------------------------- Shared --------------------------------- */

export type PressureLevel = "low" | "moderate" | "elevated" | "high";
export type Severity = "critical" | "high" | "moderate" | "low";
export type SignalDirection = "rising" | "falling" | "stable";
export type HealthState = "healthy" | "degraded" | "down";

export interface Filters {
  range: "7d" | "30d" | "90d" | "180d";
  region: string; // region name or "all"
  routeId: string; // e.g. "DEL-BOM" or "all"
  airline: string; // airline code or "all"
}

export interface ApiError {
  status: number;
  message: string;
}

/* ------------------------------- Index domain ------------------------------ */

export interface IndexSummary {
  currentIndex: number;
  previousPeriodIndex: number;
  changePct: number;
  momPct: number;
  yoyPct: number;
  pressureLevel: PressureLevel;
  pressureChangePct: number;
  routesMonitored: number;
  newRoutesThisWeek: number;
  anomaliesDetected: number;
  anomaliesCritical: number;
  forecastSignal: SignalDirection;
  forecastHorizonLabel: string;
  updatedAt: string;
}

export interface ChartAnnotation {
  id: string;
  date: string; // ISO date matching a series point
  label: string;
  description: string;
  kind: "fuel" | "demand" | "capacity" | "policy";
}

export interface IndexPoint {
  date: string; // ISO date
  value: number | null; // actual index (null inside pure-forecast tail)
  movingAvg: number | null;
  previous: number | null; // previous-period comparison series
  forecast: number | null; // forecast midpoint (null in history)
  fcLower: number | null; // confidence band
  fcUpper: number | null;
}

export interface SeriesResponse {
  points: IndexPoint[];
  annotations: ChartAnnotation[];
  lastValue: number;
}

export interface RegionIndex {
  region: string;
  index: number;
  changePct: number;
  pressureLevel: PressureLevel;
  trend: number[];
}

export interface AirlineIndex {
  code: string;
  name: string;
  color: string;
  marketSharePct: number;
  index: number;
  change7dPct: number;
  change30dPct: number;
  onTimePct: number;
  pressureLevel: PressureLevel;
  trend: number[];
}

export interface MarketCorrelationStat {
  label: string;
  value: string;
  detail: string;
}

/* ------------------------------- Route domain ------------------------------ */

export interface Airport {
  code: string;
  city: string;
  name: string;
  lat: number;
  lon: number;
  region: string;
  tier: 1 | 2 | 3;
}

export interface FareSourceQuote {
  source: string; // "Airline direct" | "MakeMyTrip" | "Cleartrip" | "EaseMyTrip" | "Yatra"
  fare: number;
}

export interface FlightDeal {
  flightNo: string; // "6E-2135"
  airline: string;
  aircraft: string; // "A320neo"
  depTime: string; // "07:40"
  arrTime: string; // "09:55"
  durationLabel: string; // "2h 15m"
  quotes: FareSourceQuote[]; // price on each website
  bestFare: number;
  bestSource: string;
}

export interface RouteInsight {
  id: string; // "DEL-BOM"
  originCode: string;
  destinationCode: string;
  originCity: string;
  destinationCity: string;
  distanceKm: number;
  currentFare: number;
  currency: "INR";
  indexValue: number;
  change7dPct: number;
  change30dPct: number;
  pressureLevel: PressureLevel;
  pressureScore: number; // 0–100
  forecastSignal: SignalDirection;
  avgFare90d: number;
  lowestFare90d: number;
  highestFare90d: number;
  bookingVelocityPct: number;
  lastUpdated: string;
  flights: FlightDeal[]; // scheduled non-stops with per-website prices
}

export interface BookingWindowBucket {
  bucket: string; // "0–1 days"
  avgFare: number;
  sampleCount: number;
}

export interface FareComponent {
  component: string;
  amount: number;
  pct: number;
  color: string;
}

export interface ComparableFare {
  product: string;
  cabin: string;
  baggageKg: number;
  refundable: boolean;
  stops: "non-stop" | "1 stop";
  fare: number;
  note: string;
}

export interface FareTrendPoint {
  date: string;
  avgFare: number | null;
  lowestFare: number | null;
  highestFare: number | null;
  movingAvg: number | null;
}

/* ------------------------------ Anomaly domain ----------------------------- */

export interface AnomalyContributor {
  factor: string;
  impactPct: number;
  detail: string;
}

export interface Anomaly {
  id: string;
  detectedAt: string; // ISO timestamp
  timeLabel: string; // preformatted "14:32" for stable rendering
  dayLabel: string; // "Today" / "Yesterday"
  routeId: string;
  routeLabel: string; // "DEL → BOM"
  indexChangePct: number;
  expectedPct: number;
  actualPct: number;
  deviationPp: number;
  severity: Severity;
  status: "open" | "acknowledged" | "resolved";
  explanation: string;
  contributors: AnomalyContributor[];
  confidencePct: number;
  fareMoveINR: number;
  flightsInScope: string[]; // flight numbers whose captures drove the flag
}

export interface AnomalyStats {
  total: number;
  critical: number;
  high: number;
  moderate: number;
  low: number;
  resolutionRatePct: number;
}

/* ------------------------------ Forecast domain ---------------------------- */

export type ForecastHorizon = 7 | 14 | 30;

export interface ForecastSummary {
  horizonDays: ForecastHorizon;
  currentIndex: number;
  forecastIndex: number;
  expectedMovementPct: number;
  confidencePct: number;
  signal: SignalDirection;
  generatedAt: string;
  modelVersion: string;
}

export interface RouteForecast {
  routeId: string;
  routeLabel: string;
  expectedChangePct: number;
  confidencePct: number;
  signal: SignalDirection;
}

export interface ConfidenceDistribution {
  level: "High" | "Medium" | "Low";
  routeCount: number;
  description: string;
}

/* ------------------------------- Fares / quality --------------------------- */

export interface FareObservation {
  id: string;
  source: string;
  airline: string;
  flightNo: string;
  depTime: string;
  arrTime: string;
  cabin: string;
  baggageKg: number;
  cancellation: string;
  stops: "non-stop" | "1 stop";
  bookingWindowDays: number;
  baseFare: number;
  taxesFees: number;
  totalFare: number;
  normalizedFare: number;
  capturedAt: string;
  verified: boolean;
  issues: string[];
}

export interface FareQualityDimension {
  key: string;
  label: string;
  passed: boolean;
  advisory?: boolean;
  detail: string;
}

export interface FareQualityScore {
  routeId: string;
  score: number;
  maxScore: number;
  grade: string;
  observationsCount: number;
  medianFare: number;
  verifiedPct: number;
  quarantineCount: number;
  dimensions: FareQualityDimension[];
}

/* ------------------------------ Sources & system --------------------------- */

export interface DataSource {
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

export interface SourceCategoryStats {
  category: "airline" | "ota";
  recordsToday: number;
  avgQualityPct: number;
  connectedCount: number;
  totalCount: number;
}

export interface PipelineStage {
  key: string;
  label: string;
  description: string;
  metric: string;
  status: HealthState;
}

export interface SystemStatus {
  overall: "operational" | "degraded";
  ingestion: HealthState;
  indexEngine: HealthState;
  analytics: HealthState;
  websocket: "connected" | "connecting" | "down";
  uptimePct: number;
}

/* ------------------------------- Pressure model ---------------------------- */

export interface PricePressureEntry {
  rank: number;
  routeId: string;
  routeLabel: string;
  pressureLevel: PressureLevel;
  pressureScore: number;
  change7dPct: number;
  primaryDriver: string;
}
