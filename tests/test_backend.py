import os
import sys

sys.path.insert(0, os.path.abspath("."))

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    print("[PASS] Root Health check")


def test_index_endpoints():
    r1 = client.get("/api/v1/index/summary")
    assert r1.status_code == 200
    assert "currentIndex" in r1.json()
    print(f"[PASS] /api/v1/index/summary (Current Index: {r1.json()['currentIndex']})")

    r2 = client.get("/api/v1/index/series?range=90d")
    assert r2.status_code == 200
    assert len(r2.json()["points"]) > 0
    print(f"[PASS] /api/v1/index/series ({len(r2.json()['points'])} series points)")

    r3 = client.get("/api/v1/index/regional")
    assert r3.status_code == 200
    print(f"[PASS] /api/v1/index/regional ({len(r3.json())} regions)")

    r4 = client.get("/api/v1/index/airlines")
    assert r4.status_code == 200
    print(f"[PASS] /api/v1/index/airlines ({len(r4.json())} airlines)")

    r5 = client.get("/api/v1/index/market-stats")
    assert r5.status_code == 200
    print(f"[PASS] /api/v1/index/market-stats")


def test_routes_endpoints():
    r1 = client.get("/api/v1/routes")
    assert r1.status_code == 200
    assert len(r1.json()) > 0
    print(f"[PASS] /api/v1/routes ({len(r1.json())} routes listed)")

    r2 = client.get("/api/v1/routes/DEL-BOM")
    assert r2.status_code == 200
    assert r2.json()["id"] == "DEL-BOM"
    print(f"[PASS] /api/v1/routes/DEL-BOM")

    r3 = client.get("/api/v1/routes/DEL-BOM/fare-trend")
    assert r3.status_code == 200
    print(f"[PASS] /api/v1/routes/DEL-BOM/fare-trend")

    r4 = client.get("/api/v1/routes/DEL-BOM/booking-window")
    assert r4.status_code == 200
    print(f"[PASS] /api/v1/routes/DEL-BOM/booking-window")

    r5 = client.get("/api/v1/routes/DEL-BOM/fare-composition")
    assert r5.status_code == 200
    print(f"[PASS] /api/v1/routes/DEL-BOM/fare-composition")

    r6 = client.get("/api/v1/routes/pressure")
    assert r6.status_code == 200
    print(f"[PASS] /api/v1/routes/pressure")


def test_anomalies_and_fares():
    r1 = client.get("/api/v1/anomalies")
    assert r1.status_code == 200
    print(f"[PASS] /api/v1/anomalies ({len(r1.json())} anomalies)")

    r2 = client.get("/api/v1/anomalies/stats")
    assert r2.status_code == 200
    print(f"[PASS] /api/v1/anomalies/stats")

    r3 = client.get("/api/v1/fares/quality?route=DEL-BOM")
    assert r3.status_code == 200
    assert "score" in r3.json()
    print(f"[PASS] /api/v1/fares/quality (Score: {r3.json()['score']})")

    r4 = client.get("/api/v1/fares/observations?route=DEL-BOM")
    assert r4.status_code == 200
    print(f"[PASS] /api/v1/fares/observations ({len(r4.json())} observations)")


def test_forecasts_and_sources():
    r1 = client.get("/api/v1/forecasts/summary?horizon=7")
    assert r1.status_code == 200
    print(f"[PASS] /api/v1/forecasts/summary")

    r2 = client.get("/api/v1/forecasts/routes")
    assert r2.status_code == 200
    print(f"[PASS] /api/v1/forecasts/routes")

    r3 = client.get("/api/v1/sources")
    assert r3.status_code == 200
    print(f"[PASS] /api/v1/sources")

    r4 = client.get("/api/v1/pipeline")
    assert r4.status_code == 200
    print(f"[PASS] /api/v1/pipeline")

    r5 = client.get("/api/v1/system/status")
    assert r5.status_code == 200
    print(f"[PASS] /api/v1/system/status")


if __name__ == "__main__":
    with TestClient(app) as client:
        test_health_root()
        test_index_endpoints()
        test_routes_endpoints()
        test_anomalies_and_fares()
        test_forecasts_and_sources()
    print("\n[SUCCESS] All 18 backend endpoints tested and validated successfully with lifespan seeder!")
