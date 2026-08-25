# AIRIS — AI-Powered Real-Time Airfare Intelligence & Price Index System

**Smart India Hackathon 2026 · Problem Statement SIH26056**

> Development of a Real-time Airfare Price Index for India through Automated Web
> Scraping of Airline and Online Travel Aggregator Portals for Augmentation of the
> Consumer Price Index (CPI).

AIRIS is a complete end-to-end **economic intelligence + airfare analytics platform** connecting automated multi-source scrapers, a validation gate and comparability engine, a FastAPI analytics backend, and an interactive Next.js intelligence dashboard.

---

## Unified System Architecture

```
AIRIS/
├── backend/                  # FastAPI Backend API & Analytics Service
│   ├── app/
│   │   ├── main.py           # Application entrypoint & CORS middleware
│   │   ├── database.py       # SQLite / PostgreSQL engine & session manager
│   │   ├── models.py         # SQLAlchemy ORM models
│   │   ├── schemas.py        # Pydantic schemas (1:1 with frontend TypeScript)
│   │   ├── services.py       # Laspeyres index calculation & forecasting engine
│   │   ├── seed.py           # Rich demo data seeder
│   │   └── routers/          # REST endpoints & WebSocket live stream
│   │       ├── indices.py    # Summary, 90d series, regional & airline indices
│   │       ├── routes.py     # Sector insights, fare trends, booking curves
│   │       ├── fares.py      # Comparability & quality dimension scoring
│   │       ├── anomalies.py  # Explainable AI anomaly detection alerts
│   │       ├── forecasts.py  # 7/14/30-day forecast trajectories & confidence
│   │       ├── sources.py    # Ingestion health, pipeline status & metrics
│   │       ├── scraper.py    # On-demand scraper trigger endpoint
│   │       └── ws.py         # Real-time WebSocket live ticker & pulses
│   └── requirements.txt      # Python dependencies (FastAPI, SQLAlchemy, NumPy...)
│
├── scraper/                  # Multi-Source Scraping & Validation Pipeline
│   ├── adapters/             # Pluggable source adapters
│   │   ├── base.py           # Abstract adapter contract & error hierarchy
│   │   ├── mock_adapter.py   # High-speed deterministic fallback generator
│   │   ├── amadeus_adapter.py# Live Amadeus Self-Service API connector
│   │   └── generic_ota_adapter.py # OTA scraping template with DOM hooks
│   ├── validator.py          # Statistical z-score bounds & cross-source agreement
│   ├── stealth.py            # Playwright browser stealth & proxy rotation
│   ├── behavior.py           # Humanized timing & randomized interaction jitter
│   ├── pipeline.py           # Concurrent collection, normalization & DB persistence
│   └── run_demo.py           # CLI scraper execution & sanity test runner
│
├── src/                      # Next.js 14 Frontend Intelligence Dashboard
│   ├── app/                  # Routes: /, index-explorer, routes, airlines,
│   │                         # anomalies, forecasts, fare-quality, data-sources, map
│   ├── components/           # UI components, layout shell, Recharts, Deck.gl map
│   ├── lib/api/              # REST client consuming FastAPI backend
│   └── lib/ws/live-feed.ts   # WebSocket feed client
│
├── tests/                    # Backend automated validation test suite
│   └── test_backend.py       # 18-endpoint test suite verifying all routes & schemas
├── start_dev.py              # Concurrent orchestrator (starts Backend + Frontend)
└── .env.local                # Local environment configuration
```

---

## Getting Started

### 1. Prerequisites
- **Node.js** v18+ and **npm**
- **Python** 3.10+

### 2. Quick Setup

```bash
# 1. Install frontend dependencies
npm install

# 2. Setup Python virtual environment & backend dependencies
python -m venv .venv
.\.venv\Scripts\pip install -r backend/requirements.txt   # (On Windows)
# source .venv/bin/activate && pip install -r backend/requirements.txt  # (On macOS/Linux)
```

### 3. Run Everything in One Command

```bash
python start_dev.py
# or
npm run dev:all
```
This boots:
- **FastAPI Backend Server**: [http://localhost:8000](http://localhost:8000) (Interactive Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs))
- **Live WebSocket Stream**: `ws://localhost:8000/ws/live`
- **Next.js Dashboard**: [http://localhost:3000](http://localhost:3000)

---

## Standalone Commands & CLI Tools

| Command | Purpose |
| ------- | ------- |
| `npm run dev:backend` | Starts the FastAPI backend with hot reloading on port 8000 |
| `npm run scraper:demo` | Runs the multi-adapter scraping & validation pipeline against the database |
| `npm run test:backend` | Runs the automated backend verification test suite (18 endpoints) |
| `npm run dev` | Runs the Next.js frontend alone on port 3000 |
| `npm run build` | Builds the production Next.js application bundle |

---

## Live Scraping with Amadeus API (Optional)

To enable live flight data through Amadeus Self-Service APIs:

```bash
set AMADEUS_CLIENT_ID=your_client_id
set AMADEUS_CLIENT_SECRET=your_client_secret
python -m scraper.run_demo --amadeus
```

---

## Demo Flow (2 Minutes)

1. **National Index Overview** — Laspeyres index KPIs, 90-day time-series with fuel/demand/policy annotations, and live real-time price feed.
2. **Interactive Route Map** — Deck.gl arc visualization across India's domestic flight corridors.
3. **Route Intelligence** — Dynamic fare trends, advance booking window curves, fare unbundling composition, and standardized comparables.
4. **Fare Quality & Comparability Engine** — Normalized 15kg baggage baseline, ancillary breakdown, and quarantine audit trail.
5. **AI Early Warning & Anomalies** — Detected surge spikes, root cause drivers, carrier coordination flags, and resolution workflow.
6. **Probabilistic Forecasting** — 7/14/30-day forecast trajectories with confidence bands.
7. **Data Sources & Pipeline** — Direct Airline vs OTA ingestion metrics, latency, data quality percentages, and pipeline health.
