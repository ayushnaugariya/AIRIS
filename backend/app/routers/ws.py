"""
WebSocket Router for real-time live price ticks, anomaly alerts, and ingestion pulses.
"""
import asyncio
import json
import random
import time
from datetime import datetime
from typing import List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["WebSocket Stream"])


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        text = json.dumps(message)
        for connection in list(self.active_connections):
            try:
                await connection.send_text(text)
            except Exception:
                self.disconnect(connection)


manager = ConnectionManager()

INGESTION_SOURCES = [
    "MakeMyTrip",
    "IndiGo Direct",
    "Cleartrip",
    "Air India Direct",
    "EaseMyTrip",
    "Akasa Air",
    "Amadeus GDS",
]

ROUTES_TICK = [
    ("DEL-BOM", 5840),
    ("DEL-BLR", 6450),
    ("BOM-BLR", 3950),
    ("BOM-GOI", 4820),
    ("DEL-CCU", 5480),
    ("DEL-HYD", 4920),
]


@router.websocket("/ws")
@router.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    current_index = 128.6
    tick_count = 0
    anomaly_counter = 500

    try:
        while True:
            await asyncio.sleep(4.0)
            tick_count += 1
            now_ms = int(time.time() * 1000)

            # 1. Index Tick
            delta = round((random.random() - 0.42) * 100) / 100
            current_index = round((current_index + delta * 0.35) * 10) / 10
            await websocket.send_text(json.dumps({
                "type": "index.tick",
                "value": current_index,
                "delta": delta,
                "ts": now_ms
            }))

            # 2. Ingestion Pulse
            src = random.choice(INGESTION_SOURCES)
            await websocket.send_text(json.dumps({
                "type": "ingestion",
                "source": src,
                "records": random.randint(380, 1800),
                "qualityPct": round((97.0 + random.random() * 2.8) * 10) / 10,
                "ts": now_ms
            }))

            # 3. Route Ticks
            for _ in range(2):
                route_id, base_fare = random.choice(ROUTES_TICK)
                delta_pct = round((random.random() - 0.45) * 1.6 * 10) / 10
                fare = max(900, int(base_fare * (1 + delta_pct / 100.0)))
                await websocket.send_text(json.dumps({
                    "type": "route.tick",
                    "routeId": route_id,
                    "fare": fare,
                    "deltaPct": delta_pct,
                    "ts": now_ms
                }))

            # 4. Periodic Live Anomaly
            if tick_count % 8 == 0:
                anomaly_counter += 1
                route_id, base_fare = random.choice(ROUTES_TICK)
                parts = route_id.split("-")
                orig, dest = parts[0], parts[1]
                spike = round(random.uniform(7.5, 16.5), 1)

                anomaly_payload = {
                    "id": f"ANM-LIVE-{anomaly_counter}",
                    "detectedAt": datetime.utcnow().isoformat(),
                    "timeLabel": datetime.utcnow().strftime("%H:%M"),
                    "dayLabel": "Today",
                    "routeId": route_id,
                    "routeLabel": f"{orig} → {dest}",
                    "indexChangePct": spike,
                    "expectedPct": 2.5,
                    "actualPct": spike,
                    "deviationPp": round(spike - 2.5, 1),
                    "severity": "critical" if spike > 12.0 else "high",
                    "status": "open",
                    "explanation": "Real-time AI detection: observed booking velocity breached dynamic boundary.",
                    "contributors": [
                        {"factor": "Yield Curve Escalation", "impactPct": 46, "detail": "Accelerated bucket depletion detected."},
                        {"factor": "Demand Spike", "impactPct": 34, "detail": "High corporate demand on evening departure."},
                        {"factor": "Inter-carrier Pass-through", "impactPct": 20, "detail": "Competitor bucket parity adjustment."}
                    ],
                    "confidencePct": random.randint(84, 98),
                    "fareMoveINR": int(spike * 72),
                    "flightsInScope": [f"6E-{random.randint(100, 999)}", f"AI-{random.randint(100, 999)}"]
                }

                await websocket.send_text(json.dumps({
                    "type": "anomaly.new",
                    "anomaly": anomaly_payload,
                    "ts": now_ms
                }))

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
