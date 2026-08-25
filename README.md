# AIRIS — AI-Powered Real-Time Airfare Intelligence & Price Index System

**Smart India Hackathon 2026 · Problem Statement SIH26056**

> Development of a Real-time Airfare Price Index for India through Automated Web
> Scraping of Airline and Online Travel Aggregator Portals for Augmentation of the
> Consumer Price Index (CPI).

AIRIS is an **economic intelligence + airfare analytics platform** — not a travel
booking site. It monitors India's airfare market through a near-real-time national
index, route-level pressure modelling, explainable anomaly detection, probabilistic
forecasting and a fare-quality engine that keeps every comparison honest.

---

## Tech stack

| Layer      | Choice                                                        |
| ---------- | ------------------------------------------------------------- |
| Framework  | Next.js 14 (App Router) · React 18 · TypeScript               |
| Styling    | Tailwind CSS · shadcn/ui-style primitives (Radix UI)          |
| Charts     | Recharts (primary) · Plotly.js (fare-surface heatmap)         |
| Geo        | Deck.gl 9 (arc map, token-free CARTO basemap tiles)           |
| Icons      | Lucide React                                                  |
| Motion     | Framer Motion (150–300 ms micro-interactions only)            |

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build && npm start
```

No API keys are required. The app runs fully on deterministic mock data until the
FastAPI backend is connected.

## Environment variables

Copy `.env.example` → `.env.local`:

| Variable                   | Purpose                                                                 |
| -------------------------- | ----------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | FastAPI REST base URL. **Empty = mock mode.** e.g. `http://localhost:8000` |
| `NEXT_PUBLIC_WS_URL`       | WebSocket endpoint for the live feed. Empty = built-in mock feed.        |

## Architecture

```
src/
├─ app/                    # Routes: /, index-explorer, routes, airlines,
│                          # anomalies, forecasts, fare-quality, data-sources
├─ components/
│  ├─ layout/              # AppShell, Sidebar, Topbar, PageHeader, BrandMark
│  ├─ dashboard/           # KPICard, IndexChart, RouteMap, panels…
│  ├─ routes/              # RouteHero, FareTrend, BookingWindow, FareSurface…
│  ├─ anomalies/           # AnomalyTable, AnomalyDetail, SeverityBadge
│  ├─ forecasts/           # ForecastChart, SummaryCards, ConfidenceMeter
│  ├─ fares/               # QualityScoreRing, Dimensions, ComparisonTable
│  ├─ sources/             # SourceCard, PipelineFlow, IngestionLog
│  ├─ providers/           # Theme, Filters, Live feed contexts
│  └─ ui/                  # Buttons, badges, selects, states, tooltips…
├─ hooks/                  # useApiData — loading / error / empty handling
├─ lib/
│  ├─ api/                 # ← THE BACKEND SEAM (client, indices, routes,
│  │                       #   anomalies, forecasts, fares, sources)
│  ├─ mock/                # Deterministic mock services + realistic data
│  └─ ws/live-feed.ts      # Mock WebSocket abstraction (replaceable)
└─ types/                  # Shared API contracts (AirfareIndex, Anomaly, …)
```

## Backend integration points (FastAPI teammate)

The UI never calls `fetch` directly. Everything goes through
`src/lib/api/index.ts`:

```ts
import { airisApi } from "@/lib/api";

const summary   = await airisApi.indices.getSummary();
const series    = await airisApi.indices.getSeries();
const routes    = await airisApi.routes.list();
const anomalies = await airisApi.anomalies.list();
const forecast  = await airisApi.forecasts.getSummary(7);
const quality   = await airisApi.fares.getQualityScore();
const sources   = await airisApi.sources.getPipeline();
```

Each module documents its intended REST mapping, e.g.
`indices.getSummary()` → `GET {NEXT_PUBLIC_API_BASE_URL}/api/v1/index/summary`.
When the base URL is set the same call switches from mock to REST — no UI changes.

Expected response shapes live in `src/types/index.ts`
(`IndexSummary`, `SeriesResponse`, `RouteInsight`, `Anomaly`, `ForecastSummary`,
`FareObservation`, `FareQualityScore`, `DataSource`, `PricePressureEntry`, …).

Live stream protocol (`src/lib/ws/live-feed.ts`):

```jsonc
{ "type": "index.tick",  "value": 128.7, "delta": 0.1, "ts": "..." }
{ "type": "anomaly.new", "anomaly": { /* Anomaly */ } }
{ "type": "ingestion",   "source": "MakeMyTrip", "records": 1204 }
```

## Mock data location

`src/lib/mock/` — seeded PRNG so every reload shows identical numbers during a demo:
`airports.ts` (20 airports with coordinates), `routes-data.ts` (30 sectors),
`series.ts` (90-day index history + 14-day forecast), `handlers.ts` (anomalies,
fares, sources, pipeline, pressure ranking).

## Demo flow (2 minutes)

1. **Overview** — national index KPIs, hero chart with event annotations.
2. **Map** — hover DEL → BOM arc; click to open Route Intelligence.
3. **Route page** — fare trend, booking-window curve, composition, comparables.
4. **Fare Quality** — comparability score 92/100, raw vs normalized toggle.
5. **Anomaly Center** — click critical row: expected vs observed + contributors.
6. **Forecasts** — 7-day outlook with confidence interval.

## Git workflow

```bash
git checkout -b feature/airis-frontend
git add .
git commit -m "feat: build AIRIS intelligence dashboard frontend"
git push -u origin feature/airis-frontend
```

---

Built for internal-round judging · dark-first design tuned for 1440×900 projection.
