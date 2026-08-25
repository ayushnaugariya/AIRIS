"""
Pydantic schemas for AIRIS API requests and responses (matching frontend TypeScript types).
"""
from datetime import datetime
from typing import List, Optional, Literal
from pydantic import BaseModel, Field


# --- Shared Types ---
PressureLevel = Literal["low", "moderate", "elevated", "high"]
Severity = Literal["critical", "high", "moderate", "low"]
SignalDirection = Literal["rising", "falling", "stable"]
HealthState = Literal["healthy", "degraded", "down"]


# --- Ingestion Schemas ---
class RawObservationCreate(BaseModel):
    origin_code: str = Field(..., example="DEL")
    destination_code: str = Field(..., example="BOM")
    airline_code: str = Field(..., example="6E")
    flight_number: Optional[str] = Field(default="6E-2134")
    source_platform: str = Field(..., example="MakeMyTrip")
    departure_timestamp: datetime
    raw_fare_amount: float = Field(..., example=5400.0)
    base_fare: Optional[float] = Field(default=4500.0)
    taxes_and_fees: Optional[float] = Field(default=900.0)
    baggage_allowance_kg: float = Field(default=15.0)
    is_direct: bool = Field(default=True)
    fare_class: str = Field(default="Economy")


# --- Index Domain ---
class IndexSummary(BaseModel):
    currentIndex: float
    previousPeriodIndex: float
    changePct: float
    momPct: float
    yoyPct: float
    pressureLevel: PressureLevel
    pressureChangePct: float
    routesMonitored: int
    newRoutesThisWeek: int
    anomaliesDetected: int
    anomaliesCritical: int
    forecastSignal: SignalDirection
    forecastHorizonLabel: str
    updatedAt: str


class ChartAnnotation(BaseModel):
    id: str
    date: str
    label: str
    description: str
    kind: Literal["fuel", "demand", "capacity", "policy"]


class IndexPoint(BaseModel):
    date: str
    value: Optional[float] = None
    movingAvg: Optional[float] = None
    previous: Optional[float] = None
    forecast: Optional[float] = None
    fcLower: Optional[float] = None
    fcUpper: Optional[float] = None


class SeriesResponse(BaseModel):
    points: List[IndexPoint]
    annotations: List[ChartAnnotation]
    lastValue: float


class RegionIndex(BaseModel):
    region: str
    index: float
    changePct: float
    pressureLevel: PressureLevel
    trend: List[float]


class AirlineIndex(BaseModel):
    code: str
    name: str
    color: str
    marketSharePct: float
    index: float
    change7dPct: float
    change30dPct: float
    onTimePct: float
    pressureLevel: PressureLevel
    trend: List[float]


class MarketCorrelationStat(BaseModel):
    label: str
    value: str
    detail: str


# --- Route Domain ---
class FareSourceQuote(BaseModel):
    source: str
    fare: float


class FlightDeal(BaseModel):
    flightNo: str
    airline: str
    aircraft: str
    depTime: str
    arrTime: str
    durationLabel: str
    quotes: List[FareSourceQuote]
    bestFare: float
    bestSource: str


class RouteInsight(BaseModel):
    id: str
    originCode: str
    destinationCode: str
    originCity: str
    destinationCity: str
    distanceKm: int
    currentFare: float
    currency: Literal["INR"] = "INR"
    indexValue: float
    change7dPct: float
    change30dPct: float
    pressureLevel: PressureLevel
    pressureScore: float
    forecastSignal: SignalDirection
    avgFare90d: float
    lowestFare90d: float
    highestFare90d: float
    bookingVelocityPct: float
    lastUpdated: str
    flights: List[FlightDeal]


class BookingWindowBucket(BaseModel):
    bucket: str
    avgFare: float
    sampleCount: int


class FareComponent(BaseModel):
    component: str
    amount: float
    pct: float
    color: str


class ComparableFare(BaseModel):
    product: str
    cabin: str
    baggageKg: float
    refundable: bool
    stops: Literal["non-stop", "1 stop"]
    fare: float
    note: str


class FareTrendPoint(BaseModel):
    date: str
    avgFare: Optional[float] = None
    lowestFare: Optional[float] = None
    highestFare: Optional[float] = None
    movingAvg: Optional[float] = None


class PricePressureEntry(BaseModel):
    rank: int
    routeId: str
    routeLabel: str
    pressureLevel: PressureLevel
    pressureScore: float
    change7dPct: float
    primaryDriver: str


# --- Anomaly Domain ---
class AnomalyContributor(BaseModel):
    factor: str
    impactPct: float
    detail: str


class Anomaly(BaseModel):
    id: str
    detectedAt: str
    timeLabel: str
    dayLabel: str
    routeId: str
    routeLabel: str
    indexChangePct: float
    expectedPct: float
    actualPct: float
    deviationPp: float
    severity: Severity
    status: Literal["open", "acknowledged", "resolved"]
    explanation: str
    contributors: List[AnomalyContributor]
    confidencePct: float
    fareMoveINR: float
    flightsInScope: List[str]


class AnomalyStats(BaseModel):
    total: int
    critical: int
    high: int
    moderate: int
    low: int
    resolutionRatePct: float


class AnomalyStatusUpdate(BaseModel):
    status: Literal["open", "acknowledged", "resolved"]


# --- Forecast Domain ---
class ForecastSummary(BaseModel):
    horizonDays: Literal[7, 14, 30]
    currentIndex: float
    forecastIndex: float
    expectedMovementPct: float
    confidencePct: float
    signal: SignalDirection
    generatedAt: str
    modelVersion: str


class RouteForecast(BaseModel):
    routeId: str
    routeLabel: str
    expectedChangePct: float
    confidencePct: float
    signal: SignalDirection


class ConfidenceDistribution(BaseModel):
    level: Literal["High", "Medium", "Low"]
    routeCount: int
    description: str


# --- Fare Quality Domain ---
class FareObservationSchema(BaseModel):
    id: str
    source: str
    airline: str
    flightNo: str
    depTime: str
    arrTime: str
    cabin: str
    baggageKg: float
    cancellation: str
    stops: Literal["non-stop", "1 stop"]
    bookingWindowDays: int
    baseFare: float
    taxesFees: float
    totalFare: float
    normalizedFare: float
    capturedAt: str
    verified: bool
    issues: List[str]


class FareQualityDimension(BaseModel):
    key: str
    label: str
    passed: bool
    advisory: Optional[bool] = None
    detail: str


class FareQualityScore(BaseModel):
    routeId: str
    score: float
    maxScore: float
    grade: str
    observationsCount: int
    medianFare: float
    verifiedPct: float
    quarantineCount: int
    dimensions: List[FareQualityDimension]


# --- Sources Domain ---
class DataSourceRecord(BaseModel):
    id: str
    name: str
    url: str
    category: Literal["airline", "ota"]
    status: Literal["connected", "degraded", "down"]
    lastIngestionMinutesAgo: int
    recordsToday: int
    dataQualityPct: float
    latencyMs: int


class SourceCategoryStats(BaseModel):
    category: Literal["airline", "ota"]
    recordsToday: int
    avgQualityPct: float
    connectedCount: int
    totalCount: int


class PipelineStage(BaseModel):
    key: str
    label: str
    description: str
    metric: str
    status: HealthState


class SystemStatus(BaseModel):
    overall: Literal["operational", "degraded"]
    ingestion: HealthState
    indexEngine: HealthState
    analytics: HealthState
    websocket: Literal["connected", "connecting", "down"]
    uptimePct: float


# --- Scraper Job Trigger ---
class ScraperTriggerRequest(BaseModel):
    routes: Optional[List[str]] = None
    adapters: Optional[List[str]] = None
    days_ahead: Optional[int] = 14
