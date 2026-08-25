"""
Core data contracts for AIRIS scraping pipeline.
"""
from __future__ import annotations
from datetime import datetime, date
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, field_validator
import hashlib


class CabinClass(str, Enum):
    ECONOMY = "ECONOMY"
    PREMIUM_ECONOMY = "PREMIUM_ECONOMY"
    BUSINESS = "BUSINESS"
    FIRST = "FIRST"


class FareObservation(BaseModel):
    """One price quote, from one source, for one specific flight product."""

    # --- identity of the flight product ---
    origin: str = Field(..., min_length=3, max_length=3, description="IATA code, e.g. DEL")
    destination: str = Field(..., min_length=3, max_length=3)
    airline: str = Field(..., description="Operating carrier, e.g. 6E, AI")
    flight_number: Optional[str] = None
    travel_date: date
    cabin_class: CabinClass = CabinClass.ECONOMY
    is_direct: bool = True

    # --- the actual fare, decomposed ---
    base_fare: float = Field(..., gt=0)
    taxes_fees: float = Field(..., ge=0)
    baggage_included_kg: Optional[float] = None
    is_refundable: bool = False
    change_fee: Optional[float] = None

    # --- provenance ---
    source: str = Field(..., description="Adapter name, e.g. 'amadeus', 'mock', 'makemytrip'")
    scraped_at: datetime = Field(default_factory=datetime.utcnow)
    raw_payload_hash: str = Field(..., description="Hash of raw source payload for audit trail")

    # --- filled in by the validator ---
    confidence_score: Optional[float] = None
    validation_status: Optional[str] = None

    @field_validator("origin", "destination")
    @classmethod
    def upper_iata(cls, v: str) -> str:
        return v.upper()

    @property
    def total_fare(self) -> float:
        return round(self.base_fare + self.taxes_fees, 2)

    @property
    def route(self) -> str:
        return f"{self.origin}-{self.destination}"

    @classmethod
    def hash_payload(cls, raw: str) -> str:
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]


class ValidationResult(BaseModel):
    accepted: bool
    reason: str
    confidence_score: float = 0.0
