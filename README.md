# AIRIS Scraper — reference implementation

This is a working implementation of the acquisition + validation pipeline
described in the AIRIS deck: adapter pattern, 4-layer stealth acquisition,
ingestion-time validation gate, and confidence scoring.

## Quick start (2 minutes, no setup beyond pip)

```bash
cd airis_scraper/..          # run from the directory containing airis_scraper/
pip install -r airis_scraper/requirements.txt
python -m airis_scraper.run_demo
```

This runs the full pipeline — collect → validate → store — using the
`MockAdapter`, which generates realistic synthetic fares (and deliberately
injects a bad observation sometimes, so you can see the validator actually
reject something). No network, no proxies, no API keys. This is also your
**live-demo fallback**: if a judge asks "what if scraping fails right now,"
this is what you switch to.

You'll see output like:

```
Running pipeline for 3 routes, adapters=['mock']

  DEL-BOM: accepted=3 rejected=1 reasons={'out_of_bounds_price': 1}
  DEL-BLR: accepted=4 rejected=0 reasons={}
  BOM-BLR: accepted=2 rejected=0 reasons={}

Total: 9 accepted, 1 rejected
Rejection breakdown: {'out_of_bounds_price': 1}

Sample stored records:
  ✓  DEL-BOM  6E  ₹  4,896  conf=0.73  src=mock
  ✗ (out_of_bounds_price)  DEL-BOM  XX  ₹    100  conf=0.00  src=mock
  ...
```

## Try the real Amadeus API (still ~5 minutes, still free)

1. Get free self-service test credentials: https://developers.amadeus.com
2. `export AMADEUS_CLIENT_ID=... AMADEUS_CLIENT_SECRET=...`
3. `python -m airis_scraper.run_demo --amadeus`

This proves the pipeline is genuinely source-agnostic — the same
validator, the same DB, the same confidence scoring, fed by a real
official API instead of the mock generator.

## Project layout

```
airis_scraper/
  models.py                    # FareObservation — the one shape every source produces
  db.py                        # SQLite storage (swap DATABASE_URL for Postgres later)
  validator.py                 # the ingestion-time validation gate
  stealth.py                   # Layer 1 (proxy) + Layer 2 (fingerprint) browser setup
  behavior.py                  # Layer 3 — human-paced interaction helpers
  pipeline.py                  # orchestrates adapter -> validator -> DB, runnable directly
  tasks.py                     # Celery tasks for scheduled/production runs
  scheduler.py                 # staggered Celery beat schedule
  run_demo.py                  # <- run this first
  adapters/
    base.py                    # SourceAdapter interface every source implements
    mock_adapter.py            # synthetic data, zero network — your demo fallback
    amadeus_adapter.py         # real official API, working out of the box
    generic_ota_adapter.py     # TEMPLATE for scraping a real OTA — fill in selectors
```

## Adding a real scraped source (e.g. MakeMyTrip, Cleartrip)

1. Copy `adapters/generic_ota_adapter.py` to `adapters/makemytrip_adapter.py`.
2. Open the target site in a browser, DevTools > Elements, and find the
   real selectors for the results container and each fare card's fields.
   Replace the placeholder selectors at the top of the file.
3. Set `name = "makemytrip"`.
4. Register it in `tasks.py`'s `ADAPTER_REGISTRY`.
5. Test it standalone first, outside the full pipeline:

   ```python
   import asyncio
   from datetime import date
   from airis_scraper.adapters.makemytrip_adapter import MakeMyTripAdapter

   async def test():
       adapter = MakeMyTripAdapter()
       results = await adapter.fetch("DEL", "BOM", date.today())
       print(results)

   asyncio.run(test())
   ```

6. If you hit blocks, get a proxy pool (a small pay-as-you-go tier from
   Bright Data / Oxylabs / IPRoyal is enough for a prototype) and pass a
   `ProxyManager` into the adapter's constructor.

### Realistic expectations for the hackathon timeline

Getting a scraper past a major OTA's bot detection reliably is genuinely
hard and can eat days. The recommended path for your demo:

- Get the **Amadeus adapter working live** (real, no ToS risk, ~5 min setup).
- Get **one** real scraped adapter (`generic_ota_adapter.py`, filled in
  against your best-behaved target) working against 1–2 routes, even if
  it's not rock solid — show it live, or in a recorded clip.
- Run the rest of the demo — dashboard, comparability engine, index,
  forecasting — against the **mock adapter's data**, which is unlimited
  and never fails.

That combination is honest (you're not claiming more than you built),
resilient (nothing depends on a live scrape working on stage), and still
demonstrates every layer of the architecture is real, working code.

## Running the scheduler for real (optional, not needed for the demo)

```bash
pip install celery redis
redis-server &                                            # separate terminal
celery -A airis_scraper.scheduler worker --loglevel=info & # separate terminal
celery -A airis_scraper.scheduler beat --loglevel=info     # separate terminal
```
