"""
Mock adapter — generates realistic synthetic domestic India fare data.
"""
from __future__ import annotations
import random
from datetime import date

from scraper.adapters.base import SourceAdapter
from scraper.models import FareObservation, CabinClass

ROUTE_BASELINES = {
    ("DEL", "BOM"): 4200,
    ("DEL", "BLR"): 5100,
    ("BOM", "BLR"): 3800,
    ("DEL", "MAA"): 5600,
    ("BOM", "MAA"): 4600,
    ("DEL", "CCU"): 4900,
    ("DEL", "HYD"): 4400,
    ("BOM", "HYD"): 3500,
    ("BLR", "HYD"): 3100,
    ("DEL", "GOI"): 5200,
    ("BOM", "GOI"): 3400,
}

AIRLINES = ["6E", "AI", "UK", "SG", "QP"]


class MockAdapter(SourceAdapter):
    name = "mock"

    def __init__(self, inject_bad_rows: bool = False, seed: int | None = None):
        self.inject_bad_rows = inject_bad_rows
        self._rng = random.Random(seed)

    def canary_route(self) -> tuple[str, str, date]:
        return ("DEL", "BOM", date.today())

    async def fetch(self, origin: str, destination: str, travel_date: date) -> list[FareObservation]:
        baseline = ROUTE_BASELINES.get((origin, destination), ROUTE_BASELINES.get((destination, origin), 4800))
        observations: list[FareObservation] = []

        chosen_airlines = self._rng.sample(AIRLINES, k=self._rng.randint(2, min(4, len(AIRLINES))))
        for airline in chosen_airlines:
            noise = self._rng.uniform(-0.12, 0.20)
            base_fare = round(baseline * (1 + noise), 2)
            taxes = round(base_fare * 0.18, 2)
            flight_no = f"{airline}-{self._rng.randint(100, 999)}"
            raw = f"{origin}{destination}{airline}{travel_date}{base_fare}{flight_no}"

            observations.append(FareObservation(
                origin=origin,
                destination=destination,
                airline=airline,
                flight_number=flight_no,
                travel_date=travel_date,
                cabin_class=CabinClass.ECONOMY,
                is_direct=self._rng.random() > 0.25,
                base_fare=base_fare,
                taxes_fees=taxes,
                baggage_included_kg=15.0,
                is_refundable=self._rng.random() > 0.65,
                source=self.name,
                raw_payload_hash=FareObservation.hash_payload(raw),
            ))

        if self.inject_bad_rows and self._rng.random() > 0.6:
            bad_fare = baseline * self._rng.choice([0.02, 10.0])
            observations.append(FareObservation(
                origin=origin,
                destination=destination,
                airline="XX",
                flight_number="XX-000",
                travel_date=travel_date,
                cabin_class=CabinClass.ECONOMY,
                is_direct=True,
                base_fare=bad_fare,
                taxes_fees=0.0,
                source=self.name,
                raw_payload_hash=FareObservation.hash_payload(f"bad{bad_fare}"),
            ))

        return observations
