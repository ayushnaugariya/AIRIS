from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

# --- INGESTION SCHEMAS ---
class RawObservationCreate(BaseModel):
    origin_code: str = Field(..., example="DEL")
    destination_code: str = Field(..., example="BOM")
    airline_code: str = Field(..., example="6E")
    flight_number: str = Field(..., example="6E-2134")
    source_platform: str = Field(..., example="MakeMyTrip")
    departure_timestamp: datetime
    raw_fare_amount: float = Field(..., example=5400.0)
    base_fare: Optional[float] = Field(default=4500.0, example=4500.0)
    taxes_and_fees: Optional[float] = Field(default=900.0, example=900.0)
    baggage_allowance_kg: int = Field(default=15, example=15)
    is_direct: bool = Field(default=True, example=True)
    fare_class: str = Field(default="Economy", example="Economy")

# --- FRONTEND INDEX RESPONSES ---
class IndexMetricResponse(BaseModel):
    scope: str  # NATIONAL, REGIONAL, ROUTE, AIRLINE
    scope_id: str
    time_bucket: datetime
    index_value: float
    percentage_change: float
    sample_size: int

# --- AI & FORECASTING SCHEMAS ---
class AnomalyFeed(BaseModel):
    route: str = Field(..., example="DEL-BOM")
    price_spike_pct: float = Field(..., example=18.5)
    severity: str = Field(..., example="CRITICAL")
    primary_contributor: str = Field(..., example="High Booking Demand / Festival Surge")
    explanation_details: str = Field(..., example="Fare rose 18.5% above 7-day moving average due to long-weekend demand.")

class ForecastResponse(BaseModel):
    route: str
    current_index: float
    forecasted_7d_index: float
    predicted_change_pct: float
    confidence_score: float

class PricePressureResponse(BaseModel):
    route: str
    pressure_level: str
    inflation_rate_pct: float
    forecast_7d_change: float
    updated_at: datetime