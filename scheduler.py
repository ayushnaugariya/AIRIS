"""
Staggered Celery beat schedule. Deliberately offsets each source so
requests don't all fire on the same synchronized tick — a synchronized
burst across every route at :00/:15/:30 is itself a detectable pattern.

Import this module from your Celery app config, or run:
    celery -A airis_scraper.scheduler beat --loglevel=info
"""
from __future__ import annotations
from datetime import date, timedelta
import random

from celery.schedules import crontab

from airis_scraper.tasks import app, ROUTE_MATRIX

random.seed(42)  # deterministic offsets across restarts — remove for true randomness

BASE_INTERVAL_MINUTES = 20
SPREAD_MINUTES = 6

beat_schedule = {}
for i, (origin, destination) in enumerate(ROUTE_MATRIX):
    offset = random.randint(-SPREAD_MINUTES, SPREAD_MINUTES)
    minute_expr = f"*/{max(5, BASE_INTERVAL_MINUTES + offset)}"

    beat_schedule[f"scrape-{origin}-{destination}"] = {
        "task": "airis_scraper.tasks.scrape_route_task",
        "schedule": crontab(minute=minute_expr),
        "args": (origin, destination, (date.today() + timedelta(days=7)).isoformat(), ["mock", "amadeus"]),
    }

# canary checks run on a fixed, independent cadence — every 30 minutes,
# regardless of the main scrape schedule
beat_schedule["canary-check"] = {
    "task": "airis_scraper.tasks.canary_check_all",
    "schedule": crontab(minute="*/30"),
    "args": (["mock", "amadeus"],),
}

app.conf.beat_schedule = beat_schedule
app.conf.timezone = "Asia/Kolkata"
