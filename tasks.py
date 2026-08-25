"""
Celery wiring for production/scheduled runs. Not needed to run the demo
(see run_demo.py) — this is what you'd deploy so scraping runs on a
schedule instead of manually.

    pip install celery redis
    redis-server &
    celery -A airis_scraper.tasks worker --loglevel=info
    celery -A airis_scraper.tasks beat --loglevel=info
"""
from __future__ import annotations
import asyncio
from datetime import date

from celery import Celery

from airis_scraper.pipeline import collect_route
from airis_scraper.adapters.mock_adapter import MockAdapter
from airis_scraper.adapters.amadeus_adapter import AmadeusAdapter
# from airis_scraper.adapters.makemytrip_adapter import MakeMyTripAdapter  # once you've built it

app = Celery("airis", broker="redis://localhost:6379/0", backend="redis://localhost:6379/1")

# central adapter registry — add real scraped-source adapters here as you build them
ADAPTER_REGISTRY = {
    "mock": MockAdapter,
    "amadeus": AmadeusAdapter,
}

# the routes your prototype actually covers — keep this small on purpose
ROUTE_MATRIX = [
    ("DEL", "BOM"),
    ("DEL", "BLR"),
    ("BOM", "BLR"),
]


@app.task(bind=True, max_retries=3, default_retry_delay=300)
def scrape_route_task(self, origin: str, destination: str, travel_date_iso: str, adapter_names: list[str]):
    travel_date = date.fromisoformat(travel_date_iso)
    adapters = [ADAPTER_REGISTRY[name]() for name in adapter_names]
    summary = asyncio.run(collect_route(adapters, origin, destination, travel_date))
    return summary


@app.task
def canary_check_all(adapter_names: list[str]):
    """Runs independently of the main scrape schedule — catches drift
    even on routes that aren't due for a full scrape yet."""
    results = {}
    for name in adapter_names:
        adapter = ADAPTER_REGISTRY[name]()
        healthy = asyncio.run(adapter.canary_check())
        results[name] = "ok" if healthy else "DRIFT_DETECTED"
        if not healthy:
            # in production: page the team / post to Slack here
            pass
    return results
