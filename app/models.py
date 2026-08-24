from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text
from datetime import datetime
from app.database import Base

class FareObservation(Base):
    __tablename__ = "fare_observations"

    id = Column(Integer, primary_key=True, index=True)
    origin_code = Column(String(10), index=True)
    destination_code = Column(String(10), index=True)
    airline_code = Column(String(10), index=True)
    flight_number = Column(String(20))
    source_platform = Column(String(50))  # e.g., MakeMyTrip, Indigo Direct
    departure_timestamp = Column(DateTime)
    booking_timestamp = Column(DateTime, default=datetime.utcnow)
    raw_fare_amount = Column(Float)
    base_fare = Column(Float)
    taxes_and_fees = Column(Float)
    standardized_fare = Column(Float)  # Output of Fare Quality Engine
    baggage_allowance_kg = Column(Integer)
    is_direct = Column(Boolean)
    fare_class = Column(String(20), default="Economy")
    quality_score = Column(Float, default=1.0)

class AnomalyRecord(Base):
    __tablename__ = "anomaly_records"

    id = Column(Integer, primary_key=True, index=True)
    route = Column(String(20), index=True)
    price_spike_pct = Column(Float)
    severity = Column(String(20))  # WARNING or CRITICAL
    primary_contributor = Column(String(255))
    explanation_details = Column(Text)
    detected_at = Column(DateTime, default=datetime.utcnow)

class RoutePricePressure(Base):
    __tablename__ = "route_price_pressures"

    id = Column(Integer, primary_key=True, index=True)
    route = Column(String(20), index=True)
    pressure_level = Column(String(20))  # MODERATE, HIGH, SEVERE
    inflation_rate_pct = Column(Float)
    forecast_7d_change = Column(Float)
    updated_at = Column(DateTime, default=datetime.utcnow)