"""
CLI runner for the AIRIS Scraping Pipeline.
Executes multi-adapter data ingestion, validation gate, normalization, and database storage.

Usage:
    python -m scraper.run_demo
    python -m scraper.run_demo --amadeus
"""
from __future__ import annotations
import asyncio
import sys
from datetime import date, timedelta

from scraper.adapters.mock_adapter import MockAdapter
from scraper.pipeline import collect_route
from backend.app.database import init_db, SessionLocal
from backend.app.models import FareObservation

ROUTES = [("DEL", "BOM"), ("DEL", "BLR"), ("BOM", "BLR"), ("BOM", "GOI")]


async def main(use_amadeus: bool = False):
    init_db()
    travel_date = date.today() + timedelta(days=14)

    adapters = [MockAdapter(seed=42)]
    if use_amadeus:
        from scraper.adapters.amadeus_adapter import AmadeusAdapter
        adapters.append(AmadeusAdapter())

    print(f"============================================================")
    print(f">> AIRIS Scraper & Validation Pipeline Runner")
    print(f"   Routes: {len(ROUTES)} | Adapters: {[a.name for a in adapters]}")
    print(f"   Target Travel Date: {travel_date}")
    print(f"============================================================\n")

    totals = {"accepted": 0, "rejected": 0, "reasons": {}}
    for origin, destination in ROUTES:
        summary = await collect_route(adapters, origin, destination, travel_date)
        print(f"  [OK] Route {origin} -> {destination}: accepted={summary['accepted']} rejected={summary['rejected']}")
        totals["accepted"] += summary["accepted"]
        totals["rejected"] += summary["rejected"]
        for reason, count in summary.get("reasons", {}).items():
            totals["reasons"][reason] = totals["reasons"].get(reason, 0) + count

    print(f"\n------------------------------------------------------------")
    print(f"Summary: {totals['accepted']} accepted, {totals['rejected']} rejected")
    if totals["reasons"]:
        print(f"Rejection breakdown: {totals['reasons']}")

    print("\nRecent Database Records:")
    db = SessionLocal()
    try:
        rows = db.query(FareObservation).order_by(FareObservation.id.desc()).limit(6).all()
        for r in rows:
            status = "[VALID]" if r.accepted else f"[REJECTED] ({r.rejection_reason})"
            print(f"  {status:<18} {r.origin_code}->{r.destination_code}  {r.airline_code:>3}  INR {r.raw_fare_amount:>7,.0f}  (Norm: INR {r.standardized_fare:>7,.0f})  src={r.source_platform}")
    finally:
        db.close()
    print("============================================================\n")


if __name__ == "__main__":
    asyncio.run(main(use_amadeus="--amadeus" in sys.argv))
