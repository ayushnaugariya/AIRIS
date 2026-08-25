"""
Generic OTA Adapter template for web-scraped flight portals.
"""
from __future__ import annotations
from datetime import date

from scraper.adapters.base import SourceAdapter, SchemaDriftError, SourceBlockedError
from scraper.models import FareObservation, CabinClass


class GenericOTAAdapter(SourceAdapter):
    name = "generic_ota"

    def __init__(self, name: str = "ota_source"):
        self.name = name

    def canary_route(self) -> tuple[str, str, date]:
        return ("DEL", "BOM", date.today())

    async def fetch(self, origin: str, destination: str, travel_date: date) -> list[FareObservation]:
        # Web-scraping template / fallback simulation
        from scraper.adapters.mock_adapter import MockAdapter
        mock_source = MockAdapter(seed=hash(f"{self.name}{origin}{destination}{travel_date}") % 10000)
        observations = await mock_source.fetch(origin, destination, travel_date)
        for obs in observations:
            obs.source = self.name
        return observations
