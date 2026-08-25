"""
Validation gate — multi-layer anomaly detection and comparability scoring.
"""
from __future__ import annotations
import statistics
from dataclasses import dataclass
from scraper.models import FareObservation, ValidationResult


@dataclass
class RouteStats:
    mean: float
    std: float
    sample_size: int

    @property
    def is_reliable(self) -> bool:
        return self.sample_size >= 5


class Validator:
    def __init__(
        self,
        min_price: float = 1200.0,
        max_price: float = 65000.0,
        z_threshold: float = 3.0,
    ):
        self.min_price = min_price
        self.max_price = max_price
        self.z_threshold = z_threshold

    def validate(
        self,
        obs: FareObservation,
        route_stats: RouteStats | None = None,
    ) -> ValidationResult:
        # 1. Absolute bounds check
        if not (self.min_price <= obs.total_fare <= self.max_price):
            return ValidationResult(accepted=False, reason="out_of_bounds_price", confidence_score=0.0)

        if obs.base_fare <= 0 or obs.taxes_fees < 0:
            return ValidationResult(accepted=False, reason="invalid_fare_components", confidence_score=0.0)

        if not obs.airline or not obs.origin or not obs.destination:
            return ValidationResult(accepted=False, reason="missing_required_field", confidence_score=0.0)

        if obs.origin == obs.destination:
            return ValidationResult(accepted=False, reason="identical_origin_destination", confidence_score=0.0)

        # 2. Statistical anomaly gate
        confidence = 0.7
        if route_stats and route_stats.is_reliable and route_stats.std > 0:
            z = abs(obs.total_fare - route_stats.mean) / route_stats.std
            if z > self.z_threshold:
                return ValidationResult(
                    accepted=False,
                    reason=f"anomaly_gate_rejected (z={z:.1f})",
                    confidence_score=0.0,
                )
            confidence = min(0.95, 0.7 + (1 - min(z / self.z_threshold, 1.0)) * 0.25)

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


def confidence_from_agreement(observations: list[FareObservation], tolerance_pct: float = 0.05) -> float:
    """Multi-source cross-validation."""
    if len(observations) < 2:
        return 0.75

    fares = [o.total_fare for o in observations]
    mean_fare = statistics.mean(fares)
    max_deviation_pct = max(abs(f - mean_fare) / mean_fare for f in fares)

    if max_deviation_pct <= tolerance_pct:
        return 0.95
    if max_deviation_pct <= tolerance_pct * 2:
        return 0.85
    return 0.60
