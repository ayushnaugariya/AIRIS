"""
End-to-end scraper execution and validation pipeline.
"""
from __future__ import annotations
import asyncio
import logging
from datetime import date, datetime
from typing import List

from scraper.adapters.base import SourceAdapter, SchemaDriftError, SourceBlockedError
from scraper.validator import Validator, confidence_from_agreement
from scraper.models import FareObservation as ScraperFareObservation
from backend.app.database import SessionLocal, init_db
from backend.app.models import FareObservation as DBFareObservation
from backend.app.services import normalize_fare

logger = logging.getLogger("airis.scraper.pipeline")


async def run_adapter(adapter: SourceAdapter, origin: str, destination: str, travel_date: date) -> List[ScraperFareObservation]:
    """Runs a single adapter with error handling and fallback."""
    try:
        return await adapter.fetch(origin, destination, travel_date)
    except SchemaDriftError as exc:
        logger.error(f"Adapter {adapter.name} schema drift: {exc}")
        return []
    except SourceBlockedError as exc:
        logger.warning(f"Adapter {adapter.name} blocked/throttled: {exc}")
        return []
    except Exception as exc:
        logger.error(f"Adapter {adapter.name} unexpected error: {exc}")
        return []


def validate_and_store(observations: List[ScraperFareObservation]) -> dict:
    """Validates observations and writes to database."""
    init_db()
    validator = Validator()
    stats = {"accepted": 0, "rejected": 0, "reasons": {}}

    if not observations:
        return stats

    # Group for cross-source agreement scoring
    by_key = {}
    for obs in observations:
        key = (obs.origin, obs.destination, obs.airline, obs.travel_date)
        by_key.setdefault(key, []).append(obs)

    db = SessionLocal()
    try:
        for key, group in by_key.items():
            agreement_confidence = confidence_from_agreement(group)

            for obs in group:
                result = validator.validate(obs)
                final_confidence = (
                    round(result.confidence_score * 0.6 + agreement_confidence * 0.4, 3)
                    if result.accepted else 0.0
                )

                # Run normalization engine
                norm_fare, quality_score = normalize_fare(
                    raw_fare=obs.total_fare,
                    baggage_kg=int(obs.baggage_included_kg or 15),
                    is_direct=obs.is_direct,
                    fare_class=obs.cabin_class.value if hasattr(obs.cabin_class, 'value') else str(obs.cabin_class)
                )

                record = DBFareObservation(
                    origin_code=obs.origin,
                    destination_code=obs.destination,
                    airline_code=obs.airline,
                    flight_number=obs.flight_number,
                    source_platform=obs.source,
                    departure_timestamp=datetime.combine(obs.travel_date, datetime.min.time()),
                    booking_timestamp=obs.scraped_at,
                    raw_fare_amount=obs.total_fare,
                    base_fare=obs.base_fare,
                    taxes_and_fees=obs.taxes_fees,
                    standardized_fare=norm_fare,
                    baggage_allowance_kg=obs.baggage_included_kg or 15.0,
                    is_direct=obs.is_direct,
                    fare_class=obs.cabin_class.value if hasattr(obs.cabin_class, 'value') else str(obs.cabin_class),
                    quality_score=quality_score,
                    confidence_score=final_confidence,
                    validation_status="ok" if result.accepted else result.reason,
                    accepted=result.accepted,
                    rejection_reason=None if result.accepted else result.reason,
                    raw_payload_hash=obs.raw_payload_hash
                )
                db.add(record)

                if result.accepted:
                    stats["accepted"] += 1
                else:
                    stats["rejected"] += 1
                    stats["reasons"][result.reason] = stats["reasons"].get(result.reason, 0) + 1

        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Error persisting observations: {e}")
    finally:
        db.close()

    return stats


async def collect_route(
    adapters: List[SourceAdapter],
    origin: str,
    destination: str,
    travel_date: date
) -> dict:
    """Runs all adapters for one route, validates and persists findings."""
    results = await asyncio.gather(*[run_adapter(a, origin, destination, travel_date) for a in adapters])
    all_obs = [obs for batch in results for obs in batch]
    return validate_and_store(all_obs)
