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

## ⚡ Quick Start — Run in 2 Steps (Even a Baby Can Do It!)

### 🪟 On Windows (PowerShell or Terminal)

Open **PowerShell** in the project folder and copy-paste these two steps:

#### **Step 1: First-Time Setup (Run once)**
```powershell
# 1. Install frontend packages
npm install

# 2. Create Python virtual environment & install backend packages
python -m venv .venv
.\.venv\Scripts\pip install -r backend/requirements.txt
```

#### **Step 2: Start the System!**
```powershell
python start_dev.py
```
*(Or if you prefer npm: `npm run dev:all`)*

---

### 🍎 On macOS / Linux (Terminal)

#### **Step 1: First-Time Setup (Run once)**
```bash
# 1. Install frontend packages
npm install

# 2. Create Python virtual environment & install backend packages
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

#### **Step 2: Start the System!**
```bash
python3 start_dev.py
```

---

## 🌐 That's It! Open These Links in Your Browser:

| What you want to see | Open this link | What it shows |
| :--- | :--- | :--- |
| 📊 **Main Web Dashboard** | **[http://localhost:3000](http://localhost:3000)** | Full National Index, Live Prices & Inflation KPIs |
| 🗺️ **India Airfare Map** | **[http://localhost:3000/map](http://localhost:3000/map)** | Interactive 3D route map across Indian cities |
| 🛫 **Route Intelligence** | **[http://localhost:3000/routes](http://localhost:3000/routes)** | Advance booking curves & unbundled taxes (Delhi, Mumbai, Chennai, etc.) |
| 🚨 **AI Anomaly Center** | **[http://localhost:3000/anomalies](http://localhost:3000/anomalies)** | Root-cause price surge alerts & resolution workflow |
| 📈 **7–30 Day Forecasts** | **[http://localhost:3000/forecasts](http://localhost:3000/forecasts)** | Future price predictions with confidence intervals |
| ⚖️ **Fare Quality Engine** | **[http://localhost:3000/fare-quality](http://localhost:3000/fare-quality)** | 15kg check-in baggage normalization audit |
| 📡 **Pipeline Health** | **[http://localhost:3000/data-sources](http://localhost:3000/data-sources)** | Live scraper & API connector status |
| ⚡ **FastAPI Backend Docs** | **[http://localhost:8000/docs](http://localhost:8000/docs)** | Live interactive Swagger testing for all 18 backend endpoints |

---

## ❓ Troubleshooting & FAQs

<details>
<summary><b>🔴 Issue: "Port 3000 is already in use"</b></summary>

If port 3000 is busy, Next.js will automatically open on **`http://localhost:3001`** or **`http://localhost:3002`**.  
Check the terminal output to see which port it selected.  
To free port 3000 on Windows:
```powershell
# Stop any orphaned node processes
Stop-Process -Name node -Force
```
</details>

<details>
<summary><b>🔴 Issue: "python: command not found"</b></summary>

Make sure Python 3.10+ is installed from [python.org](https://python.org). On Windows, make sure you checked the box: **"Add Python to PATH"** during installation.  
On macOS/Linux, type `python3` instead of `python`.
</details>

<details>
<summary><b>🔴 Issue: "How do I test the scraper directly?"</b></summary>

Run the standalone demo scraper with 1 command:
```powershell
python -m scraper.run_demo
```
This scrapes multiple routes, validates prices through statistical $z$-scores, and saves clean records straight to the database.
</details>

<details>
<summary><b>🔴 Issue: "How do I run the automated backend tests?"</b></summary>

Run the full test suite with 1 command:
```powershell
.\.venv\Scripts\python tests/test_backend.py
# or: npm run test:backend
```
It tests all 18 REST endpoints and verifies database seeding.
</details>

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

## 🛠 Available Helper Commands

| Command | Description |
| :--- | :--- |
| `python start_dev.py` | Launches both FastAPI backend & Next.js frontend together |
| `npm run dev:all` | Same as `start_dev.py` |
| `npm run dev:backend` | Starts only the FastAPI backend server on `http://127.0.0.1:8000` |
| `npm run dev` | Starts only the Next.js frontend on `http://localhost:3000` |
| `npm run scraper:demo` | Runs the multi-adapter scraping & validation pipeline against the database |
| `npm run test:backend` | Executes the automated 18-endpoint validation test suite |
| `npm run build` | Builds the production bundle for Next.js |

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
3. **Route Intelligence**: Select `DEL → BOM` or `MAA → DEL` to inspect historical yield curves, advance booking steepness, unbundled taxes, and comparable fares.
4. **Comparability & Fare Quality**: Review the 94.6/100 quality score and how 15kg baggage standardizations prevent unbundling bias.
5. **AI Early Warning & Anomalies**: Inspect real-time price alerts, explainable root-cause contributors, and acknowledge/resolve flagged items.
6. **Probabilistic Forecasting**: Toggle 7, 14, and 30-day forecast horizons with confidence envelopes.
7. **Live Ingestion Telemetry**: View real-time ingestion counters and data quality metrics across direct carrier and OTA feeds.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
