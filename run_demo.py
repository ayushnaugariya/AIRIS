"""
Run this to see the full pipeline work end-to-end in about 2 seconds,
using the mock adapter — zero network, zero setup. Good for your actual
demo fallback, and good as a sanity check that the pipeline logic itself
is correct before you plug in real scrapers.

    python -m airis_scraper.run_demo

Then try the Amadeus adapter (needs free credentials — see amadeus_adapter.py):

    export AMADEUS_CLIENT_ID=...
    export AMADEUS_CLIENT_SECRET=...
    python -m airis_scraper.run_demo --amadeus
"""
from __future__ import annotations
import asyncio
import sys
from datetime import date, timedelta

from airis_scraper.adapters.mock_adapter import MockAdapter
from airis_scraper.pipeline import collect_route
from airis_scraper.db import init_db, get_session, FareRecord


ROUTES = [("DEL", "BOM"), ("DEL", "BLR"), ("BOM", "BLR")]


async def main(use_amadeus: bool = False):
    init_db()
    travel_date = date.today() + timedelta(days=14)

    adapters = [MockAdapter(seed=1)]
    if use_amadeus:
        from airis_scraper.adapters.amadeus_adapter import AmadeusAdapter
        adapters.append(AmadeusAdapter())

    print(f"Running pipeline for {len(ROUTES)} routes, adapters={[a.name for a in adapters]}\n")

    totals = {"accepted": 0, "rejected": 0, "reasons": {}}
    for origin, destination in ROUTES:
        summary = await collect_route(adapters, origin, destination, travel_date)
        print(f"  {origin}-{destination}: accepted={summary['accepted']} rejected={summary['rejected']} "
              f"reasons={summary['reasons']}")
        totals["accepted"] += summary["accepted"]
        totals["rejected"] += summary["rejected"]
        for reason, count in summary["reasons"].items():
            totals["reasons"][reason] = totals["reasons"].get(reason, 0) + count

    print(f"\nTotal: {totals['accepted']} accepted, {totals['rejected']} rejected")
    if totals["reasons"]:
        print(f"Rejection breakdown: {totals['reasons']}")

    print("\nSample stored records:")
    with get_session() as session:
        rows = session.query(FareRecord).order_by(FareRecord.id.desc()).limit(8).all()
        for r in rows:
            status = "✓" if r.accepted else f"✗ ({r.rejection_reason})"
            print(f"  {status}  {r.origin}-{r.destination}  {r.airline:>3}  "
                  f"₹{r.total_fare:>8,.0f}  conf={r.confidence_score:.2f}  src={r.source}")


if __name__ == "__main__":
    asyncio.run(main(use_amadeus="--amadeus" in sys.argv))
