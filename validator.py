"""
The validation gate. Nothing reaches the canonical fare store without
passing through here first — this is what separates AIRIS from a raw
scrape dump, and it's the concrete implementation of Slide 6's
8-technique list.
"""
from __future__ import annotations
import statistics
from dataclasses import dataclass

from airis_scraper.models import FareObservation, ValidationResult


@dataclass
class RouteStats:
    """Rolling statistics for a route, used as the anomaly-gate baseline.
    In production this comes from a windowed query over recent history;
    for the prototype, seed it from the mock adapter or a small backfill."""
    mean: float
    std: float
    sample_size: int

    @property
    def is_reliable(self) -> bool:
        # don't gate aggressively on a route we barely have history for yet
        return self.sample_size >= 5


class Validator:
    def __init__(self, z_threshold: float = 4.0, min_price: float = 500.0, max_price: float = 200_000.0):
        self.z_threshold = z_threshold
        self.min_price = min_price
        self.max_price = max_price

    def validate(self, obs: FareObservation, route_stats: RouteStats | None) -> ValidationResult:
        # 1. absolute sanity bounds — catches garbage regardless of history
        if not (self.min_price <= obs.total_fare <= self.max_price):
            return ValidationResult(accepted=False, reason="out_of_bounds_price", confidence_score=0.0)

        if obs.base_fare <= 0 or obs.taxes_fees < 0:
            return ValidationResult(accepted=False, reason="invalid_fare_components", confidence_score=0.0)

        if not obs.airline or not obs.origin or not obs.destination:
            return ValidationResult(accepted=False, reason="missing_required_field", confidence_score=0.0)

        if obs.origin == obs.destination:
            return ValidationResult(accepted=False, reason="identical_origin_destination", confidence_score=0.0)

        # 2. statistical anomaly gate — only once we have enough history to trust it
        confidence = 0.7  # baseline confidence for a structurally valid observation
        if route_stats and route_stats.is_reliable and route_stats.std > 0:
            z = abs(obs.total_fare - route_stats.mean) / route_stats.std
            if z > self.z_threshold:
                return ValidationResult(
                    accepted=False,
                    reason=f"anomaly_gate_rejected (z={z:.1f})",
                    confidence_score=0.0,
                )
            # closer to the historical mean -> higher confidence, capped at 0.95
            confidence = min(0.95, 0.7 + (1 - min(z / self.z_threshold, 1.0)) * 0.25)

        # 3. freshness is checked separately at read-time via scraped_at TTL —
        #    see is_fresh() below, applied when *reading* for index construction,
        #    not at ingestion (a valid-but-old observation should still be stored,
        #    just never silently treated as current).

        return ValidationResult(accepted=True, reason="ok", confidence_score=round(confidence, 3))

    @staticmethod
    def compute_route_stats(historical_fares: list[float]) -> RouteStats | None:
        if len(historical_fares) < 2:
            return None
        return RouteStats(
            mean=statistics.mean(historical_fares),
            std=statistics.pstdev(historical_fares),
            sample_size=len(historical_fares),
        )


def is_fresh(obs: FareObservation, ttl_minutes: int = 180) -> bool:
    """Freshness TTL — used when reading for index construction. An
    observation past its TTL is never silently reused; it's treated as
    missing for that route/slot until a fresh one arrives."""
    from datetime import datetime, timezone
    age = datetime.now(timezone.utc) - obs.scraped_at.replace(tzinfo=timezone.utc)
    return age.total_seconds() <= ttl_minutes * 60


def confidence_from_agreement(observations: list[FareObservation], tolerance_pct: float = 0.05) -> float:
    """Multi-source cross-validation — technique #1 from Slide 6.
    Given several observations for the same route/date/airline from
    different sources, returns a confidence multiplier based on how much
    they agree. Wide disagreement lowers confidence rather than being
    silently averaged away."""
    if len(observations) < 2:
        return 0.7  # single-source — can't cross-validate, moderate confidence

    fares = [o.total_fare for o in observations]
    mean_fare = statistics.mean(fares)
    max_deviation_pct = max(abs(f - mean_fare) / mean_fare for f in fares)

    if max_deviation_pct <= tolerance_pct:
        return 0.95
    if max_deviation_pct <= tolerance_pct * 2:
        return 0.8
    return 0.5  # sources disagree meaningfully — flag, don't hide it
