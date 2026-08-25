"""
Orchestrates: adapter.fetch() -> Validator -> DB storage.

This is deliberately runnable synchronously with no Celery/Redis
dependency — good enough to prove the pipeline end-to-end in a demo.
tasks.py wraps this same function for scheduled/distributed execution.
"""
from __future__ import annotations
import asyncio
import logging
from datetime import date

from airis_scraper.adapters.base import SourceAdapter, SchemaDriftError, SourceBlockedError
from airis_scraper.models import FareObservation
from airis_scraper.validator import Validator, confidence_from_agreement
from airis_scraper.db import get_session, init_db, FareRecord, route_fare_history

logger = logging.getLogger("airis.pipeline")

# adapters that got a schema-drift/block signal get disabled here until
# someone investigates — this is the "canary trip" behavior in practice
DISABLED_ADAPTERS: set[str] = set()


async def run_adapter(adapter: SourceAdapter, origin: str, destination: str, travel_date: date) -> list[FareObservation]:
    if adapter.name in DISABLED_ADAPTERS:
        logger.warning("skipping disabled adapter: %s", adapter.name)
        return []
    try:
        observations = await adapter.fetch(origin, destination, travel_date)
        logger.info("%s: fetched %d observations for %s-%s", adapter.name, len(observations), origin, destination)
        return observations
    except SchemaDriftError as exc:
        logger.error("SCHEMA DRIFT on %s — disabling adapter: %s", adapter.name, exc)
        DISABLED_ADAPTERS.add(adapter.name)
        # in production: fire an alert (Slack webhook / email) here
        return []
    except SourceBlockedError as exc:
        logger.warning("%s: blocked this cycle, will retry next schedule: %s", adapter.name, exc)
        return []


def validate_and_store(observations: list[FareObservation]) -> dict:
    """Runs every observation through the validation gate and persists
    the outcome — accepted AND rejected, for audit."""
    init_db()
    validator = Validator()
    stats_summary = {"accepted": 0, "rejected": 0, "reasons": {}}

    # group by route+airline+date so agreement scoring (multi-source
    # cross-validation) has something to compare against
    by_key: dict[tuple, list[FareObservation]] = {}
    for obs in observations:
        key = (obs.origin, obs.destination, obs.airline, obs.travel_date)
        by_key.setdefault(key, []).append(obs)

    with get_session() as session:
        for key, group in by_key.items():
            origin, destination = key[0], key[1]
            history = route_fare_history(session, origin, destination)
            route_stats = Validator.compute_route_stats(history)
            agreement_confidence = confidence_from_agreement(group)

            for obs in group:
                result = validator.validate(obs, route_stats)
                # blend structural confidence with cross-source agreement
                final_confidence = round((result.confidence_score * 0.6 + agreement_confidence * 0.4), 3) if result.accepted else 0.0

                record = FareRecord(
                    origin=obs.origin, destination=obs.destination, airline=obs.airline,
                    flight_number=obs.flight_number, travel_date=obs.travel_date,
                    cabin_class=obs.cabin_class.value, is_direct=obs.is_direct,
                    base_fare=obs.base_fare, taxes_fees=obs.taxes_fees, total_fare=obs.total_fare,
                    source=obs.source, scraped_at=obs.scraped_at, raw_payload_hash=obs.raw_payload_hash,
                    confidence_score=final_confidence,
                    validation_status=result.reason,
                    accepted=result.accepted,
                    rejection_reason=None if result.accepted else result.reason,
                )
                session.add(record)

                if result.accepted:
                    stats_summary["accepted"] += 1
                else:
                    stats_summary["rejected"] += 1
                    stats_summary["reasons"][result.reason] = stats_summary["reasons"].get(result.reason, 0) + 1

        session.commit()

    return stats_summary


async def collect_route(adapters: list[SourceAdapter], origin: str, destination: str, travel_date: date) -> dict:
    """Runs every adapter for one route, in parallel, then validates and
    stores everything collected. This is the function a Celery task or a
    cron job wraps."""
    results = await asyncio.gather(
        *[run_adapter(a, origin, destination, travel_date) for a in adapters]
    )
    all_observations = [obs for batch in results for obs in batch]
    return validate_and_store(all_observations)
