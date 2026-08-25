# AIRIS — AI-Powered Real-Time Airfare Intelligence & Price Index System

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4+-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Deck.gl](https://img.shields.io/badge/Deck.gl-9.0+-green?style=flat-square)](https://deck.gl/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

> **Smart India Hackathon 2026 · Problem Statement SIH26056**  
> *Development of a Real-time Airfare Price Index for India through Automated Web Scraping of Airline and Online Travel Aggregator Portals for Augmentation of the Consumer Price Index (CPI).*

---

## 📌 Executive Summary

**AIRIS (Airfare Intelligence & Real-Time Index System)** is an enterprise economic intelligence and regulatory monitoring platform designed for statistical bodies (e.g., MoSPI/CSO), aviation authorities (DGCA), and market analysts.

Rather than acting as a commercial flight search engine, AIRIS solves the fundamental challenge of **measuring real-time air transport inflation** across India's domestic aviation corridors. It automatically ingests fares across airline direct APIs, GDS systems, and online travel aggregators (OTAs), cleans and normalizes ancillary baggage/restrictions through an innovative **Comparability Engine**, computes representative **Laspeyres/Jevons Price Indices**, and detects abnormal market spikes using **Explainable AI Anomaly Detection**.

---

## 🏛 System Architecture

AIRIS is built around a decoupled 4-tier pipeline connecting automated data collection, statistical validation, economic index calculation, and interactive intelligence dashboards:

```
                      ┌──────────────────────────────────────────────────────────┐
                      │                 DATA ACQUISITION LAYER                   │
                      │  Direct Carrier APIs · Amadeus GDS · Stealth OTA Scraper │
                      └────────────────────────────┬─────────────────────────────┘
                                                   │
                                                   ▼
                      ┌──────────────────────────────────────────────────────────┐
                      │              VALIDATION & ANOMALY GATE                   │
                      │   Price Bounds · Multi-Source Agreement · Z-Score Filter  │
                      └────────────────────────────┬─────────────────────────────┘
                                                   │
                                                   ▼
                      ┌──────────────────────────────────────────────────────────┐
                      │             COMPARABILITY & INDEX ENGINE                 │
                      │   15kg Baggage Normalization · Unbundled Ancillaries     │
                      │      Laspeyres Weighted Indices · 7-30d ML Forecasts     │
                      └────────────────────────────┬─────────────────────────────┘
                                                   │
                                                   ▼
                      ┌──────────────────────────────────────────────────────────┐
                      │              PRESENTATION & STREAMING LAYER              │
                      │  FastAPI Backend (REST + WebSockets) ↔ Next.js Dashboard │
                      └──────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Innovations & Features

### 1. Laspeyres & Jevons Airfare Price Indices
- **National & Regional Aggregations**: Continuous calculation of baseline indices (Base = 100) capturing high-frequency passenger price inflation.
- **Carrier & Cluster Drilldowns**: Monitor carrier-wise yield curves (IndiGo, Air India, Vistara, Akasa, SpiceJet) and regional hubs (North, West, South, East, Tier-2 corridors).

### 2. Comparability & Ancillary Normalization Engine
- **Fair Comparisons**: Solves unbundling bias (e.g., hand-baggage-only fares vs full-service tickets) by standardizing every fare to a calibrated 15kg check-in baseline.
- **Decomposed Tariff Structures**: Isolates carrier base yield, fuel surcharges (ATF), User Development Fees (UDF), Passenger Service Fees (PSF), and statutory GST.

### 3. Explainable AI Anomaly & Early Warning Engine
- **Root Cause Decomposition**: When price spikes breach dynamic bounds, the system decomposes contributors (carrier bucket coordination, festival surges, capacity restrictions, or fuel pass-through).
- **Audit Workflow**: Flagged anomalies move through `Open` → `Acknowledged` → `Resolved` lifecycle states.

### 4. High-Frequency Live Streaming
- WebSocket feed (`/ws/live`) delivering real-time index ticks, ingestion heartbeats, sector repricing, and instant anomaly alerts without page reloads.

### 5. Interactive Geospatial Flight Network
- Deck.gl GPU-accelerated arc visualizations across India's trunk corridors color-coded by inflation and price pressure levels.

---

## 📂 Repository Structure

```
AIRIS/
├── backend/                  # FastAPI Backend & AI Analytics Service
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

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js** v18.0+ & **npm**
- **Python** 3.10+

### 2. Installation

```bash
# Clone repository
git clone https://github.com/ayushnaugariya/AIRIS.git
cd AIRIS

# Install frontend dependencies
npm install

# Setup Python virtual environment & backend dependencies
python -m venv .venv
.\.venv\Scripts\pip install -r backend/requirements.txt   # Windows
# source .venv/bin/activate && pip install -r backend/requirements.txt  # macOS / Linux
```

### 3. Run the Full System (One Command)

```bash
python start_dev.py
# or
npm run dev:all
```

- **Frontend Intelligence Dashboard**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Interactive Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Live WebSocket Endpoint**: `ws://localhost:8000/ws/live`

---

## 🛠 Available Scripts & CLI Tools

| Command | Description |
| :--- | :--- |
| `npm run dev:all` | Launches both the FastAPI backend and Next.js frontend concurrently |
| `npm run dev:backend` | Starts only the FastAPI backend server on `http://127.0.0.1:8000` |
| `npm run dev` | Starts only the Next.js frontend on `http://localhost:3000` |
| `npm run scraper:demo` | Runs the multi-adapter scraping & validation pipeline against the database |
| `npm run test:backend` | Executes the automated 18-endpoint validation test suite |
| `npm run build` | Builds the production bundle for Next.js |

---

## 📡 REST API Reference

The FastAPI backend serves 18 endpoints structured across 7 functional domains:

### 1. Indices Domain (`/api/v1/index`)
- `GET /api/v1/index/summary` — National price index KPIs, YoY/MoM changes, and pressure rating.
- `GET /api/v1/index/series?range=90d` — 90-day historical time-series with moving averages and forecast bands.
- `GET /api/v1/index/regional` — Regional price indices across Northern, Western, Southern, Eastern hubs.
- `GET /api/v1/index/airlines` — Airline-wise yield indices, market share %, and OTP metrics.
- `GET /api/v1/index/market-stats` — Macroeconomic benchmarks (ATF fuel prices, seat load factors).

### 2. Routes Domain (`/api/v1/routes`)
- `GET /api/v1/routes` — Monitored domestic trunk and regional sector catalogue.
- `GET /api/v1/routes/{id}` — In-depth sector intelligence (e.g., `DEL-BOM`).
- `GET /api/v1/routes/{id}/fare-trend` — 30-day daily fare trajectories and moving averages.
- `GET /api/v1/routes/{id}/booking-window` — Advance booking curve pricing escalation buckets (0–1d to 30d+).
- `GET /api/v1/routes/{id}/fare-composition` — Unbundled component breakdown (Base, ATF, UDF, Taxes).
- `GET /api/v1/routes/{id}/comparable-fares` — Standardized product tier comparisons.
- `GET /api/v1/routes/pressure` — Price pressure hotspot ranking.

### 3. Fare Quality Domain (`/api/v1/fares`)
- `GET /api/v1/fares/quality?route={id}` — Comparability audit score and 5-dimension validation breakdown.
- `GET /api/v1/fares/observations?route={id}` — High-frequency normalized observation log.

### 4. AI Anomalies Domain (`/api/v1/anomalies`)
- `GET /api/v1/anomalies` — Detected price spike alerts and explainability drivers.
- `GET /api/v1/anomalies/stats` — Severity breakdown and resolution rates.
- `PATCH /api/v1/anomalies/{id}/status` — Update anomaly resolution state (`open`, `acknowledged`, `resolved`).

### 5. Forecasts Domain (`/api/v1/forecasts`)
- `GET /api/v1/forecasts/summary?horizon={7|14|30}` — Probabilistic outlook and expected inflation delta.
- `GET /api/v1/forecasts/routes` — Sector-wise predicted trajectories.
- `GET /api/v1/forecasts/confidence` — Model confidence distribution.

### 6. Sources & Pipeline Health (`/api/v1`)
- `GET /api/v1/sources` — Active airline API and OTA connector health.
- `GET /api/v1/sources/stats?category={airline|ota}` — Ingestion volume and quality pass rates.
- `GET /api/v1/pipeline` — 4-stage pipeline telemetry.
- `GET /api/v1/system/status` — Platform operational state and uptime.

### 7. Scraper Operations (`/api/v1/scraper`)
- `POST /api/v1/scraper/trigger` — Trigger on-demand asynchronous collection jobs across target sectors.

---

## 🌐 Live Scraping with Amadeus API

To connect to live GDS flight offers:

```bash
# Windows
set AMADEUS_CLIENT_ID=your_client_id
set AMADEUS_CLIENT_SECRET=your_client_secret
python -m scraper.run_demo --amadeus

# macOS / Linux
export AMADEUS_CLIENT_ID=your_client_id
export AMADEUS_CLIENT_SECRET=your_client_secret
python -m scraper.run_demo --amadeus
```

---

## 🎯 2-Minute Presentation Demo Walkthrough

1. **National Airfare Index**: Inspect the live Laspeyres index (128.5), macroeconomic indicators, and the 90-day time-series annotated with regulatory/fuel revisions.
2. **Interactive Route Map**: Explore India's domestic aviation network with GPU-accelerated Deck.gl arcs highlighting high-pressure corridors.
3. **Route Intelligence**: Select `DEL → BOM` to inspect historical yield curves, advance booking steepness, unbundled taxes, and comparable fares.
4. **Comparability & Fare Quality**: Review the 94.6/100 quality score and how 15kg baggage standardizations prevent unbundling bias.
5. **AI Early Warning & Anomalies**: Inspect real-time price alerts, explainable root-cause contributors, and acknowledge/resolve flagged items.
6. **Probabilistic Forecasting**: Toggle 7, 14, and 30-day forecast horizons with confidence envelopes.
7. **Live Ingestion Telemetry**: View real-time ingestion counters and data quality metrics across direct carrier and OTA feeds.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
