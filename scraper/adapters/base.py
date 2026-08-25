"""
Abstract base class and error hierarchy for all AIRIS source adapters.
"""
from __future__ import annotations
from abc import ABC, abstractmethod
from datetime import date
from scraper.models import FareObservation


class AdapterError(Exception):
    """Base error for all adapter failures."""
    pass


class SchemaDriftError(AdapterError):
    """Target site DOM/JSON shape changed — canary check tripped."""
    pass


class SourceBlockedError(AdapterError):
    """Proxy/CAPTCHA block detected."""
    pass


class SourceAdapter(ABC):
    name: str = "base"

    @abstractmethod
    async def fetch(self, origin: str, destination: str, travel_date: date) -> list[FareObservation]:
        """Fetches and extracts normalized FareObservations for one route and date."""
        raise NotImplementedError

    @abstractmethod
    def canary_route(self) -> tuple[str, str, date]:
        """Returns a stable route used to test whether this adapter is healthy."""
        raise NotImplementedError

    async def canary_check(self) -> bool:
        """Runs a minimal scrape against the canary route to detect schema drift."""
        origin, destination, travel_date = self.canary_route()
        try:
            results = await self.fetch(origin, destination, travel_date)
            return len(results) > 0
        except AdapterError:
            return False
        except Exception:
            return False
