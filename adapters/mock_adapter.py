"""
Mock adapter — generates realistic synthetic fare data with no network
dependency at all.

This exists for exactly the reason your Q&A prep doc names: "what if your
live scraper fails or a site blocks you during the actual demo?" Run the
whole pipeline (validation, storage, index construction) against this
adapter, and it works every time, on stage, with zero flakiness.

It also deliberately injects a few bad observations (implausible price,
missing fields) so you can demo the validation gate actually rejecting
something live, instead of just asserting that it would.
"""
from __future__ import annotations
import random
from datetime import date

from airis_scraper.adapters.base import SourceAdapter
from airis_scraper.models import FareObservation, CabinClass

# rough baseline fares (INR) for a few common routes — tune these to taste
ROUTE_BASELINES = {
    ("DEL", "BOM"): 4200,
    ("DEL", "BLR"): 5100,
    ("BOM", "BLR"): 3800,
    ("DEL", "MAA"): 5600,
    ("BOM", "MAA"): 4600,
}

AIRLINES = ["6E", "AI", "UK", "SG"]


class MockAdapter(SourceAdapter):
    name = "mock"

    def __init__(self, inject_bad_rows: bool = True, seed: int | None = None):
        self.inject_bad_rows = inject_bad_rows
        self._rng = random.Random(seed)

    def canary_route(self) -> tuple[str, str, date]:
        return ("DEL", "BOM", date.today())

    async def fetch(self, origin: str, destination: str, travel_date: date) -> list[FareObservation]:
        baseline = ROUTE_BASELINES.get((origin, destination), 5000)
        observations: list[FareObservation] = []

        for airline in self._rng.sample(AIRLINES, k=self._rng.randint(2, len(AIRLINES))):
            noise = self._rng.uniform(-0.15, 0.25)
            base_fare = round(baseline * (1 + noise), 2)
            taxes = round(base_fare * 0.18, 2)
            raw = f"{origin}{destination}{airline}{travel_date}{base_fare}"

            observations.append(FareObservation(
                origin=origin, destination=destination, airline=airline,
                flight_number=f"{airline}{self._rng.randint(100, 999)}",
                travel_date=travel_date,
                cabin_class=CabinClass.ECONOMY,
                is_direct=self._rng.random() > 0.3,
                base_fare=base_fare, taxes_fees=taxes,
                baggage_included_kg=15.0,
                is_refundable=self._rng.random() > 0.7,
                source=self.name,
                raw_payload_hash=FareObservation.hash_payload(raw),
            ))

        if self.inject_bad_rows and self._rng.random() > 0.5:
            # simulate a garbage observation to prove the validator catches it
            bad_fare = baseline * self._rng.choice([0.02, 12.0])  # absurdly low or high
            observations.append(FareObservation(
                origin=origin, destination=destination, airline="XX",
                travel_date=travel_date, base_fare=bad_fare, taxes_fees=0.0,
                source=self.name,
                raw_payload_hash=FareObservation.hash_payload(f"bad{bad_fare}"),
            ))

        return observations
