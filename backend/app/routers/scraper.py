"""
Router for triggering and monitoring live scraping pipeline jobs.
"""
from datetime import date, timedelta
from typing import Dict, Any
from fastapi import APIRouter, BackgroundTasks

from backend.app.schemas import ScraperTriggerRequest
from scraper.adapters.mock_adapter import MockAdapter
from scraper.adapters.amadeus_adapter import AmadeusAdapter
from scraper.pipeline import collect_route

router = APIRouter(prefix="/api/v1/scraper", tags=["Scraper Engine"])

DEFAULT_ROUTES = [("DEL", "BOM"), ("DEL", "BLR"), ("BOM", "BLR"), ("BOM", "GOI")]


async def run_scraper_job(routes: list[tuple[str, str]], days_ahead: int, adapter_names: list[str]):
    """Background worker executing scraper for specified routes."""
    travel_date = date.today() + timedelta(days=days_ahead)
    adapters = []

    if "mock" in adapter_names:
        adapters.append(MockAdapter(seed=None))
    if "amadeus" in adapter_names:
        adapters.append(AmadeusAdapter())
    if not adapters:
        adapters.append(MockAdapter())

    for origin, destination in routes:
        await collect_route(adapters, origin, destination, travel_date)


@router.post("/trigger")
async def trigger_scraper(request: ScraperTriggerRequest, background_tasks: BackgroundTasks) -> Dict[str, Any]:
    """
    Triggers an asynchronous scraping run across selected routes and adapters.
    """
    selected_routes = []
    if request.routes:
        for r in request.routes:
            parts = r.upper().split("-")
            if len(parts) == 2:
                selected_routes.append((parts[0], parts[1]))
    if not selected_routes:
        selected_routes = DEFAULT_ROUTES

    adapter_names = request.adapters or ["mock"]
    days_ahead = request.days_ahead or 14

    background_tasks.add_task(run_scraper_job, selected_routes, days_ahead, adapter_names)

    return {
        "status": "queued",
        "message": f"Scraping triggered for {len(selected_routes)} routes with adapters {adapter_names}",
        "routes": [f"{orig}-{dest}" for orig, dest in selected_routes],
        "travelDate": (date.today() + timedelta(days=days_ahead)).isoformat()
    }
