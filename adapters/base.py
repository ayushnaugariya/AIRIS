"""
Every data source — a scraper, an API, a mock — implements SourceAdapter.

This is what makes "one source breaking doesn't take the pipeline down"
actually true: the scheduler and pipeline only ever talk to this interface,
never to source-specific code directly.
"""
from __future__ import annotations
from abc import ABC, abstractmethod
from datetime import date
import logging

from airis_scraper.models import FareObservation

logger = logging.getLogger("airis.adapter")


class SchemaDriftError(Exception):
    """Raised when a source's page/response no longer matches what we expect.

    This is the canary trip — it should stop that adapter and raise an
    alert, not let it keep running and silently return garbage.
    """


class SourceBlockedError(Exception):
    """Raised when a source actively blocks/rate-limits the request."""


class SourceAdapter(ABC):
    name: str = "base"

    @abstractmethod
    async def fetch(self, origin: str, destination: str, travel_date: date) -> list[FareObservation]:
        """Fetch fare observations for one route + date. Must raise
        SchemaDriftError or SourceBlockedError rather than returning
        malformed data — never fail silently."""
        raise NotImplementedError

    async def canary_check(self) -> bool:
        """Run a known, cheap query and confirm the response still looks
        like what we expect. Called on a schedule, independent of the
        main scrape cycle, so drift is caught within minutes."""
        try:
            known_route = self.canary_route()
            results = await self.fetch(*known_route)
            return len(results) > 0
        except Exception as exc:  # noqa: BLE001 — canary must never crash the caller
            logger.warning("canary_check failed for %s: %s", self.name, exc)
            return False

    def canary_route(self) -> tuple[str, str, date]:
        """Override with a route that reliably has fares, for canary checks."""
        raise NotImplementedError
