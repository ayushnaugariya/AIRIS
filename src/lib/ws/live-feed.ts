import type { Anomaly } from "@/types";
import * as mock from "@/lib/mock/handlers";
import { apiConfig } from "@/lib/api/client";

/**
 * LiveFeed — a clean WebSocket abstraction.
 *
 * In demo mode it synthesizes index ticks, ingestion heartbeats and new
 * anomalies on realistic intervals. When NEXT_PUBLIC_WS_URL is configured,
 * `connect()` opens the real socket instead; event names and payloads match
 * the documented backend stream so no UI code changes.
 *
 * Backend protocol:
 *   { "type": "index.tick",   "value": 128.7, "delta": 0.1, "ts": "..." }
 *   { "type": "anomaly.new",  "anomaly": Anomaly }
 *   { "type": "ingestion",    "source": "MakeMyTrip", "records": 1204, "ts": "..." }
 */

export type FeedEvent =
  | { type: "index.tick"; value: number; delta: number; ts: number }
  | { type: "anomaly.new"; anomaly: Anomaly; ts: number }
  | { type: "ingestion"; source: string; records: number; qualityPct: number; ts: number }
  | { type: "route.tick"; routeId: string; fare: number; deltaPct: number; ts: number };

export type FeedListener = (event: FeedEvent) => void;

const TICK_MS = 5000;
const ANOMALY_EVERY_N_TICKS = 9;
const INGESTION_SOURCES = [
  "MakeMyTrip",
  "IndiGo (direct)",
  "Cleartrip",
  "Air India",
  "EaseMyTrip",
  "Akasa Air",
  "Yatra",
];

export class LiveFeed {
  private listeners = new Set<FeedListener>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private tickCount = 0;
  private value = 128.6;
  private socket: WebSocket | null = null;
  private anomalyCounter = 2482;

  get connected(): boolean {
    if (!apiConfig.mockMode) return this.socket?.readyState === WebSocket.OPEN;
    return this.timer !== null;
  }

  start(): void {
    this.stop();
    if (!apiConfig.mockMode) {
      this.connectReal();
      return;
    }
    this.timer = setInterval(() => this.emitTick(), TICK_MS);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.socket?.close();
    this.socket = null;
  }

  subscribe(listener: FeedListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(event: FeedEvent): void {
    this.listeners.forEach((fn) => fn(event));
  }

  private emitTick(): void {
    this.tickCount += 1;
    const delta = Math.round((Math.random() - 0.42) * 100) / 100;
    this.value = Math.round((this.value + delta * 0.35) * 10) / 10;

    this.emit({ type: "index.tick", value: this.value, delta, ts: Date.now() });
    this.emitIngestion();
    this.emitRouteTicks();

    // Occasionally surface a fresh critical anomaly for the notification UX.
    if (this.tickCount % ANOMALY_EVERY_N_TICKS === 0) {
      this.anomalyCounter += 1;
      const routes: [string, string, number][] = [
        ["DEL", "BOM", 11.8],
        ["BOM", "GOI", 8.9],
        ["DEL", "SXR", 7.4],
        ["MAA", "DEL", 6.1],
      ];
      const [from, to, move] = routes[Math.floor(Math.random() * routes.length)];
      const route = mock.ROUTES.find((r) => r.id === `${from}-${to}`);
      const anomaly: Anomaly = {
        id: `ANM-${this.anomalyCounter}`,
        detectedAt: new Date().toISOString(),
        timeLabel: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }),
        dayLabel: "Today",
        routeId: `${from}-${to}`,
        routeLabel: `${from} → ${to}`,
        indexChangePct: move,
        expectedPct: 3.4,
        actualPct: move,
        deviationPp: Math.round((move - 3.4) * 10) / 10,
        severity: move > 10 ? "critical" : "high",
        status: "open",
        explanation:
          "Live-streamed detection: observed movement breached the model's expected band. Contributors are being scored.",
        contributors: [
          { factor: "Capacity reduction", impactPct: 41, detail: "Departures below schedule baseline." },
          { factor: "High booking velocity", impactPct: 37, detail: "Bookings/day above 30-day baseline." },
          { factor: "Demand surge", impactPct: 22, detail: "Search volume elevated for this sector." },
        ],
        confidencePct: 72 + Math.round(Math.random() * 15),
        fareMoveINR: Math.round(move * 62),
        flightsInScope: (route?.flights ?? []).map((f) => f.flightNo).slice(0, 3),
      };
      this.emit({ type: "anomaly.new", anomaly, ts: Date.now() });
      // keep the shared list fresh for late subscribers
      mock.ANOMALIES.unshift(anomaly);
      if (mock.ANOMALIES.length > 14) mock.ANOMALIES.pop();
    }
  }

  private emitIngestion(): void {
    const source = INGESTION_SOURCES[Math.floor(Math.random() * INGESTION_SOURCES.length)];
    this.emit({
      type: "ingestion",
      source,
      records: 380 + Math.floor(Math.random() * 1400),
      qualityPct: Math.round((97 + Math.random() * 2.5) * 10) / 10,
      ts: Date.now(),
    });
  }

  /** Two random sectors reprice on every tick — drives the live route feed. */
  private emitRouteTicks(): void {
    const n = mock.ROUTES.length;
    for (let k = 0; k < 2; k++) {
      const route = mock.ROUTES[Math.floor(Math.random() * n)];
      const deltaPct = Math.round((Math.random() - 0.45) * 1.6 * 10) / 10;
      this.emit({
        type: "route.tick",
        routeId: route.id,
        fare: Math.max(900, Math.round(route.currentFare * (1 + deltaPct / 100))),
        deltaPct,
        ts: Date.now(),
      });
    }
  }

  private connectReal(): void {
    if (typeof window === "undefined") return;
    try {
      this.socket = new WebSocket(apiConfig.wsUrl);

      this.socket.onopen = () => {
        // Broadcast an initial tick to confirm connection
        this.emit({ type: "index.tick", value: this.value, delta: 0, ts: Date.now() });
      };

      this.socket.onmessage = (msg) => {
        try {
          const parsed = JSON.parse(msg.data as string) as FeedEvent & { ts?: string | number };
          let ts = Date.now();
          if (typeof parsed.ts === "number" && !isNaN(parsed.ts)) {
            ts = parsed.ts;
          } else if (typeof parsed.ts === "string") {
            const parsedNum = Number(parsed.ts);
            ts = !isNaN(parsedNum) ? parsedNum : (Date.parse(parsed.ts) || Date.now());
          }
          this.emit({ ...parsed, ts } as FeedEvent);
        } catch {
          /* ignore malformed frames */
        }
      };

      this.socket.onclose = () => {
        // Auto-reconnect after 3 seconds
        setTimeout(() => {
          if (this.socket?.readyState !== WebSocket.OPEN) {
            this.connectReal();
          }
        }, 3000);
      };
    } catch {
      /* socket unavailable — stay silent in demo */
    }
  }
}

export const liveFeed = new LiveFeed();
