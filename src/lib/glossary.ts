/**
 * AIRIS glossary — every analytical term on the platform gets a plain-language
 * definition on hover via the <Term> component.
 */

export interface GlossaryEntry {
  label: string;
  definition: string;
}

export const GLOSSARY = {
  index: {
    label: "Airfare Price Index",
    definition:
      "Weighted measure of economy fare levels vs a fixed base period (2024 = 100). Built only from normalized, quality-scored fare observations.",
  },
  "regional-index": {
    label: "Regional index",
    definition:
      "The national index computed separately for six zones — North, West, South, East, Central and Northeast — to expose geographic divergence.",
  },
  "airline-index": {
    label: "Airline index",
    definition:
      "A carrier's economy fare level vs the base period, share-weighted inside the national aggregate.",
  },
  pressure: {
    label: "Price pressure",
    definition:
      "How quickly fares are rising on a sector relative to its normal seasonal behaviour — not just the absolute price level.",
  },
  "pressure-score": {
    label: "Pressure score",
    definition:
      "0–100 composite of recent price movement, historical deviation, booking velocity, route demand and live anomaly signals.",
  },
  "routes-monitored": {
    label: "Routes monitored",
    definition:
      "Sectors with at least one successful fare capture across connected sources in the last 24 hours.",
  },
  anomaly: {
    label: "Anomaly",
    definition:
      "A fare movement that breaches the model's expected band for that sector, flagged with an evidence trail for review.",
  },
  severity: {
    label: "Severity",
    definition:
      "Impact classification for a detection: critical (immediate review), high (elevated deviation), moderate (watchlist).",
  },
  explainability: {
    label: "Explainable AI",
    definition:
      "Every flag ships with expected vs observed values, contributing factors and a confidence level — no black-box output.",
  },
  "forecast-signal": {
    label: "Forecast signal",
    definition: "Direction the forecasting model expects fares to move over the coming week: rising, falling or stable.",
  },
  forecast: {
    label: "Forecast index",
    definition: "Projected national index value at the end of the selected horizon, from the median simulation path.",
  },
  "expected-movement": {
    label: "Expected movement",
    definition: "Median projected percentage change over the horizon; half of model simulations land above, half below.",
  },
  confidence: {
    label: "Confidence",
    definition:
      "Probability that realized movement stays inside the published band. Below 65% the forecast is advisory-only by policy.",
  },
  "confidence-interval": {
    label: "Confidence interval",
    definition: "The shaded range where the index is expected to land with ~80% probability.",
  },
  "moving-average": {
    label: "Moving average",
    definition: "7-day rolling mean of the index — smooths day-to-day scraping noise to reveal the true trend.",
  },
  "previous-period": {
    label: "Previous period",
    definition: "The same window shifted one period back — the fair baseline for change calculations.",
  },
  "booking-window": {
    label: "Booking window",
    definition:
      "Days between purchase and departure. The single biggest lever on price: last-week bookings can cost 2× the 30-day window.",
  },
  "booking-velocity": {
    label: "Booking velocity",
    definition: "Speed of new bookings vs the 30-day baseline. Sustained acceleration typically precedes fare hikes.",
  },
  "comparability-score": {
    label: "Fare Comparability Score",
    definition:
      "0–100 score of how fairly a fare can be compared after normalization. Below 70, the observation is quarantined from the index.",
  },
  normalization: {
    label: "Normalization",
    definition:
      "Aligning taxes, baggage, cabin, cancellation, stops and booking window before any two fares are compared.",
  },
  "normalized-fare": {
    label: "Normalized fare",
    definition: "The product-adjusted equivalent fare — the only value that enters index computation.",
  },
  "comparable-fares": {
    label: "Comparable fares",
    definition:
      "Different products (Standard/Flex/Business) on one sector. Only like-for-like products are ever aggregated together.",
  },
  "deviation-pp": {
    label: "Deviation (pp)",
    definition: "Percentage points between observed and expected movement — the size of the surprise.",
  },
  contributors: {
    label: "Contributors",
    definition: "Model-estimated factors behind a deviation with their share of attribution, ranked by impact.",
  },
  otp: {
    label: "On-time performance (OTP)",
    definition: "Share of departures within 15 minutes of schedule, trailing 30 days.",
  },
  "atf-correlation": {
    label: "ATF correlation",
    definition: "Pearson correlation (r) between the fare index and aviation turbine fuel spot prices over 90 days.",
  },
  "load-factor": {
    label: "Load factor",
    definition: "Share of available seats actually filled. Above ~85%, carriers typically push fares upward.",
  },
  ask: {
    label: "ASK (Available Seat Kilometres)",
    definition: "Standard airline capacity measure — seats offered × distance flown. Supply changes move fares.",
  },
  elasticity: {
    label: "Fare elasticity",
    definition: "Demand response to a 1% fare increase. Negative values mean demand falls as prices rise.",
  },
  "data-quality": {
    label: "Data quality",
    definition: "Share of captured records passing schema validation, deduplication and outlier screening.",
  },
  "fare-observation": {
    label: "Fare observation",
    definition: "One timestamped capture of a specific flight × fare product × source combination.",
  },
  pipeline: {
    label: "Processing pipeline",
    definition:
      "Source → Ingestion → Validation → Normalization → Index engine → AI analytics → Dashboard. Each stage is monitored.",
  },
  ingestion: {
    label: "Data ingestion",
    definition: "Raw fare captures queued and timestamped at the moment of scraping — preserving exact reference periods.",
  },
  "index-engine": {
    label: "Index engine",
    definition: "Recomputes route-level and national indices every 15 minutes using a Laspeyres-style chained method.",
  },
  "ai-analytics": {
    label: "AI analytics",
    definition: "Anomaly detection and forecasting models that score every capture cycle and power the explanations here.",
  },
  websocket: {
    label: "WebSocket",
    definition: "Push channel streaming live index ticks, ingestion events and anomaly alerts to this dashboard.",
  },
  "capture-cycle": {
    label: "Capture cycle",
    definition: "One full scrape-and-score sweep across all connected sources.",
  },
  ota: {
    label: "OTA",
    definition: "Online Travel Aggregator — MakeMyTrip, Cleartrip, EaseMyTrip, Yatra. Markups are normalized out.",
  },
  cpi: {
    label: "CPI",
    definition: "Consumer Price Index — India's official inflation statistic. AIRIS airfare data augments its transport basket.",
  },
  atf: {
    label: "ATF",
    definition: "Aviation Turbine Fuel — roughly 40% of an airline's operating cost; fare pass-through follows ATF revisions.",
  },
  "flight-number": {
    label: "Flight number",
    definition: "Carrier code + service number (e.g. 6E-2135) identifying one scheduled flight — the unit fares are captured on.",
  },
  volatility: {
    label: "Volatility",
    definition: "Standard deviation of daily index changes over 30 days — how choppy the market is, independent of direction.",
  },
  scenario: {
    label: "Scenario",
    definition: "Stress-path for the forecast: fuel shock, capacity cut or demand surge applied to the model's drivers.",
  },
  backtest: {
    label: "Backtest",
    definition: "Re-running the model on past weeks and scoring it against what actually happened — published transparently.",
  },
  quarantine: {
    label: "Quarantine",
    definition: "Observations scoring below 70 are held out of the index pending source verification — visible, never silently dropped.",
  },
  "fare-ladder": {
    label: "Fare ladder",
    definition: "Median one-way economy fare by carrier across trunk routes — who prices above or below the market.",
  },
} as const satisfies Record<string, GlossaryEntry>;

export type GlossaryKey = keyof typeof GLOSSARY;
