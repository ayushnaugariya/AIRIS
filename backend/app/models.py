"""
SQLAlchemy database models for AIRIS.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, JSON
from backend.app.database import Base


class FareObservation(Base):
    __tablename__ = "fare_observations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    origin_code = Column(String(10), index=True, nullable=False)
    destination_code = Column(String(10), index=True, nullable=False)
    airline_code = Column(String(10), index=True, nullable=False)
    flight_number = Column(String(20), nullable=True)
    source_platform = Column(String(50), index=True, nullable=False)
    departure_timestamp = Column(DateTime, nullable=True)
    booking_timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    raw_fare_amount = Column(Float, nullable=False)
    base_fare = Column(Float, default=0.0)
    taxes_and_fees = Column(Float, default=0.0)
    standardized_fare = Column(Float, default=0.0)
    baggage_allowance_kg = Column(Float, default=15.0)
    is_direct = Column(Boolean, default=True)
    fare_class = Column(String(20), default="Economy")
    quality_score = Column(Float, default=1.0)
    confidence_score = Column(Float, default=0.85)
    validation_status = Column(String(50), default="ok")
    accepted = Column(Boolean, default=True, index=True)
    rejection_reason = Column(String(100), nullable=True)
    raw_payload_hash = Column(String(64), nullable=True)


class AnomalyRecord(Base):
    __tablename__ = "anomaly_records"

    id = Column(String(50), primary_key=True, index=True)  # e.g., "anom-001"
    detected_at = Column(DateTime, default=datetime.utcnow, index=True)
    time_label = Column(String(20))
    day_label = Column(String(20))
    route_id = Column(String(20), index=True)
    route_label = Column(String(50))
    index_change_pct = Column(Float)
    expected_pct = Column(Float)
    actual_pct = Column(Float)
    deviation_pp = Column(Float)
    severity = Column(String(20), index=True)  # critical, high, moderate, low
    status = Column(String(20), default="open", index=True)  # open, acknowledged, resolved
    explanation = Column(Text)
    contributors = Column(JSON)  # List of {factor, impactPct, detail}
    confidence_pct = Column(Float)
    fare_move_inr = Column(Float)
    flights_in_scope = Column(JSON)  # List of flight numbers


class RoutePricePressure(Base):
    __tablename__ = "route_price_pressures"

    id = Column(Integer, primary_key=True, autoincrement=True)
    rank = Column(Integer)
    route_id = Column(String(20), index=True, unique=True)
    route_label = Column(String(50))
    pressure_level = Column(String(20))  # low, moderate, elevated, high
    pressure_score = Column(Float)
    change_7d_pct = Column(Float)
    primary_driver = Column(String(255))
    updated_at = Column(DateTime, default=datetime.utcnow)


class DataSourceRecordModel(Base):
    __tablename__ = "data_sources"

    id = Column(String(50), primary_key=True)
    name = Column(String(100))
    url = Column(String(255))
    category = Column(String(20))  # airline, ota
    status = Column(String(20))  # connected, degraded, down
    last_ingestion_minutes_ago = Column(Integer)
    records_today = Column(Integer)
    data_quality_pct = Column(Float)
    latency_ms = Column(Integer)
