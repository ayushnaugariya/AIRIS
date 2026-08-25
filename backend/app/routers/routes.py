"""
Router for Route insights, fare trend curves, booking windows, fare composition, and price pressure.
Supports comprehensive domestic Indian flight network (30+ sectors).
"""
from datetime import datetime, timedelta
import math
import random
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import RoutePricePressure
from backend.app.schemas import (
    RouteInsight,
    FareTrendPoint,
    BookingWindowBucket,
    FareComponent,
    ComparableFare,
    PricePressureEntry,
    FlightDeal,
    FareSourceQuote,
)

router = APIRouter(prefix="/api/v1/routes", tags=["Routes"])

# Indian Airports Database
AIRPORTS_DB = {
    "DEL": {"city": "New Delhi", "name": "Indira Gandhi International", "region": "North"},
    "BOM": {"city": "Mumbai", "name": "Chhatrapati Shivaji Maharaj Intl.", "region": "West"},
    "BLR": {"city": "Bengaluru", "name": "Kempegowda International", "region": "South"},
    "HYD": {"city": "Hyderabad", "name": "Rajiv Gandhi International", "region": "South"},
    "MAA": {"city": "Chennai", "name": "Chennai International", "region": "South"},
    "CCU": {"city": "Kolkata", "name": "Netaji Subhas Chandra Bose Intl.", "region": "East"},
    "AMD": {"city": "Ahmedabad", "name": "Sardar Vallabhbhai Patel Intl.", "region": "West"},
    "PNQ": {"city": "Pune", "name": "Pune International", "region": "West"},
    "GOI": {"city": "Goa", "name": "Dabolim / Manohar Intl.", "region": "West"},
    "COK": {"city": "Kochi", "name": "Cochin International", "region": "South"},
    "LKO": {"city": "Lucknow", "name": "Chaudhary Charan Singh Intl.", "region": "Central"},
    "JAI": {"city": "Jaipur", "name": "Jaipur International", "region": "North"},
    "GAU": {"city": "Guwahati", "name": "Lokpriya Gopinath Bordoloi Intl.", "region": "Northeast"},
    "PAT": {"city": "Patna", "name": "Jay Prakash Narayan", "region": "East"},
    "BBI": {"city": "Bhubaneswar", "name": "Biju Patnaik International", "region": "East"},
    "IXC": {"city": "Chandigarh", "name": "Shaheed Bhagat Singh Intl.", "region": "North"},
    "SXR": {"city": "Srinagar", "name": "Sheikh ul-Alam International", "region": "North"},
    "VNS": {"city": "Varanasi", "name": "Lal Bahadur Shastri", "region": "Central"},
    "IDR": {"city": "Indore", "name": "Devi Ahilya Bai Holkar", "region": "Central"},
    "TRV": {"city": "Thiruvananthapuram", "name": "Trivandrum International", "region": "South"},
}

ROUTE_SPECS = [
    {"from": "DEL", "to": "BOM", "distanceKm": 1148, "baseFare": 6842, "pressure": "high", "pressureScore": 92.0, "change7d": 12.4, "forecast": "rising"},
    {"from": "BOM", "to": "DEL", "distanceKm": 1148, "baseFare": 6510, "pressure": "high", "pressureScore": 88.0, "change7d": 10.8, "forecast": "rising"},
    {"from": "DEL", "to": "BLR", "distanceKm": 1740, "baseFare": 5928, "pressure": "high", "pressureScore": 84.0, "change7d": 10.1, "forecast": "rising"},
    {"from": "BLR", "to": "DEL", "distanceKm": 1740, "baseFare": 5672, "pressure": "elevated", "pressureScore": 79.0, "change7d": 8.8, "forecast": "rising"},
    {"from": "BOM", "to": "BLR", "distanceKm": 844, "baseFare": 4895, "pressure": "high", "pressureScore": 81.0, "change7d": 9.6, "forecast": "rising"},
    {"from": "DEL", "to": "HYD", "distanceKm": 1255, "baseFare": 5410, "pressure": "elevated", "pressureScore": 74.0, "change7d": 7.6, "forecast": "rising"},
    {"from": "MAA", "to": "DEL", "distanceKm": 1760, "baseFare": 7436, "pressure": "elevated", "pressureScore": 71.0, "change7d": 6.9, "forecast": "rising"},
    {"from": "DEL", "to": "CCU", "distanceKm": 1301, "baseFare": 6934, "pressure": "moderate", "pressureScore": 66.0, "change7d": 5.2, "forecast": "stable"},
    {"from": "BOM", "to": "GOI", "distanceKm": 442, "baseFare": 4128, "pressure": "elevated", "pressureScore": 69.0, "change7d": 8.1, "forecast": "rising"},
    {"from": "GOI", "to": "BOM", "distanceKm": 442, "baseFare": 3876, "pressure": "moderate", "pressureScore": 58.0, "change7d": 4.3, "forecast": "stable"},
    {"from": "GAU", "to": "DEL", "distanceKm": 1452, "baseFare": 8145, "pressure": "moderate", "pressureScore": 63.0, "change7d": 4.9, "forecast": "stable"},
    {"from": "DEL", "to": "GAU", "distanceKm": 1452, "baseFare": 7862, "pressure": "moderate", "pressureScore": 60.0, "change7d": 4.1, "forecast": "stable"},
    {"from": "AMD", "to": "DEL", "distanceKm": 772, "baseFare": 3428, "pressure": "moderate", "pressureScore": 55.0, "change7d": 3.6, "forecast": "stable"},
    {"from": "PNQ", "to": "BLR", "distanceKm": 735, "baseFare": 3965, "pressure": "moderate", "pressureScore": 57.0, "change7d": 3.9, "forecast": "stable"},
    {"from": "HYD", "to": "PNQ", "distanceKm": 504, "baseFare": 3518, "pressure": "low", "pressureScore": 42.0, "change7d": 1.4, "forecast": "stable"},
    {"from": "CCU", "to": "BBI", "distanceKm": 368, "baseFare": 2984, "pressure": "low", "pressureScore": 38.0, "change7d": -0.8, "forecast": "falling"},
    {"from": "DEL", "to": "JAI", "distanceKm": 241, "baseFare": 2764, "pressure": "low", "pressureScore": 35.0, "change7d": -1.6, "forecast": "falling"},
    {"from": "JAI", "to": "AMD", "distanceKm": 525, "baseFare": 3208, "pressure": "low", "pressureScore": 40.0, "change7d": 0.9, "forecast": "stable"},
    {"from": "COK", "to": "MAA", "distanceKm": 502, "baseFare": 3654, "pressure": "moderate", "pressureScore": 52.0, "change7d": 3.1, "forecast": "stable"},
    {"from": "TRV", "to": "BLR", "distanceKm": 531, "baseFare": 3792, "pressure": "low", "pressureScore": 44.0, "change7d": 1.8, "forecast": "stable"},
    {"from": "IXC", "to": "DEL", "distanceKm": 240, "baseFare": 2894, "pressure": "low", "pressureScore": 37.0, "change7d": -1.1, "forecast": "stable"},
    {"from": "DEL", "to": "SXR", "distanceKm": 650, "baseFare": 5948, "pressure": "elevated", "pressureScore": 72.0, "change7d": 7.2, "forecast": "rising"},
    {"from": "PAT", "to": "DEL", "distanceKm": 850, "baseFare": 4462, "pressure": "moderate", "pressureScore": 54.0, "change7d": 3.3, "forecast": "stable"},
    {"from": "VNS", "to": "DEL", "distanceKm": 664, "baseFare": 3986, "pressure": "moderate", "pressureScore": 51.0, "change7d": 2.8, "forecast": "stable"},
    {"from": "IDR", "to": "BOM", "distanceKm": 512, "baseFare": 3648, "pressure": "low", "pressureScore": 45.0, "change7d": 2.1, "forecast": "stable"},
    {"from": "LKO", "to": "DEL", "distanceKm": 420, "baseFare": 3326, "pressure": "low", "pressureScore": 41.0, "change7d": 1.6, "forecast": "stable"},
    {"from": "BBI", "to": "DEL", "distanceKm": 1245, "baseFare": 5874, "pressure": "moderate", "pressureScore": 56.0, "change7d": 3.7, "forecast": "stable"},
    {"from": "MAA", "to": "COK", "distanceKm": 502, "baseFare": 3588, "pressure": "low", "pressureScore": 43.0, "change7d": 1.2, "forecast": "stable"},
    {"from": "BLR", "to": "PNQ", "distanceKm": 735, "baseFare": 3842, "pressure": "moderate", "pressureScore": 53.0, "change7d": 3.0, "forecast": "stable"},
    {"from": "HYD", "to": "MAA", "distanceKm": 510, "baseFare": 3416, "pressure": "low", "pressureScore": 39.0, "change7d": 0.4, "forecast": "stable"},
    {"from": "DEL", "to": "PNQ", "distanceKm": 1170, "baseFare": 5980, "pressure": "elevated", "pressureScore": 73.0, "change7d": 7.0, "forecast": "rising"},
    {"from": "PNQ", "to": "DEL", "distanceKm": 1170, "baseFare": 5710, "pressure": "moderate", "pressureScore": 64.0, "change7d": 5.4, "forecast": "rising"},
    {"from": "BOM", "to": "MAA", "distanceKm": 1030, "baseFare": 5210, "pressure": "moderate", "pressureScore": 62.0, "change7d": 4.4, "forecast": "stable"},
    {"from": "MAA", "to": "BLR", "distanceKm": 290, "baseFare": 3180, "pressure": "low", "pressureScore": 41.0, "change7d": 1.2, "forecast": "stable"},
    {"from": "BLR", "to": "COK", "distanceKm": 370, "baseFare": 3460, "pressure": "moderate", "pressureScore": 55.0, "change7d": 3.4, "forecast": "stable"},
    {"from": "CCU", "to": "GAU", "distanceKm": 520, "baseFare": 3890, "pressure": "moderate", "pressureScore": 58.0, "change7d": 4.6, "forecast": "rising"},
    {"from": "PNQ", "to": "GOI", "distanceKm": 520, "baseFare": 4020, "pressure": "elevated", "pressureScore": 67.0, "change7d": 6.8, "forecast": "rising"},
    {"from": "AMD", "to": "BOM", "distanceKm": 440, "baseFare": 3350, "pressure": "low", "pressureScore": 45.0, "change7d": 2.2, "forecast": "stable"},
    {"from": "IXC", "to": "BOM", "distanceKm": 1220, "baseFare": 5480, "pressure": "moderate", "pressureScore": 60.0, "change7d": 4.9, "forecast": "stable"},
    {"from": "LKO", "to": "BOM", "distanceKm": 1070, "baseFare": 4980, "pressure": "moderate", "pressureScore": 57.0, "change7d": 3.8, "forecast": "stable"},
    {"from": "PAT", "to": "CCU", "distanceKm": 480, "baseFare": 3590, "pressure": "low", "pressureScore": 47.0, "change7d": 2.4, "forecast": "stable"},
    {"from": "VNS", "to": "BOM", "distanceKm": 940, "baseFare": 4520, "pressure": "low", "pressureScore": 49.0, "change7d": 2.6, "forecast": "stable"},
]

CARRIERS = [
    {"code": "6E", "name": "IndiGo", "aircraft": ["A320neo", "A321neo"]},
    {"code": "AI", "name": "Air India", "aircraft": ["A320neo", "B787-8"]},
    {"code": "UK", "name": "Vistara", "aircraft": ["A320neo", "A321neo"]},
    {"code": "QP", "name": "Akasa Air", "aircraft": ["B737-MAX"]},
    {"code": "SG", "name": "SpiceJet", "aircraft": ["B737-800", "Q400"]},
]

QUOTE_SOURCES = ["Airline direct", "MakeMyTrip", "Cleartrip", "EaseMyTrip", "Yatra"]


def hash_seed(s: str) -> int:
    h = 2166136261
    for char in s:
        h ^= ord(char)
        h = (h * 16777619) & 0xFFFFFFFF
    return h


def build_flight_deals_for_spec(spec: dict, base_fare: float) -> List[FlightDeal]:
    deals = []
    rng = random.Random(hash_seed(f"{spec['from']}-{spec['to']}"))
    block_mins = int(55 + (spec["distanceKm"] / 800.0) * 60)
    hrs = block_mins // 60
    mins = block_mins % 60
    dur_label = f"{hrs}h {mins:02d}m" if hrs > 0 else f"{mins}m"

    for i in range(8):
        carrier = rng.choice(CARRIERS)
        flight_no = f"{carrier['code']}-{rng.randint(100, 999)}"
        dep_hour = 6 + i * 2
        dep_time = f"{dep_hour:02d}:{rng.randint(0, 50):02d}"
        arr_hour = (dep_hour + hrs + (1 if mins > 30 else 0)) % 24
        arr_time = f"{arr_hour:02d}:{((rng.randint(0, 50) + mins) % 60):02d}"

        flight_base = round(base_fare * rng.uniform(0.88, 1.22) / 10) * 10
        quotes = []
        for src in QUOTE_SOURCES:
            markup = 1.0 if src == "Airline direct" else rng.uniform(0.98, 1.03)
            quotes.append(FareSourceQuote(source=src, fare=round(flight_base * markup / 10) * 10))

        best = min(quotes, key=lambda q: q.fare)
        deals.append(FlightDeal(
            flightNo=flight_no,
            airline=carrier["name"],
            aircraft=rng.choice(carrier["aircraft"]),
            depTime=dep_time,
            arrTime=arr_time,
            durationLabel=dur_label,
            quotes=quotes,
            bestFare=best.fare,
            bestSource=best.source
        ))
    return sorted(deals, key=lambda d: d.depTime)


def construct_route_insight(spec: dict) -> RouteInsight:
    orig = spec["from"]
    dest = spec["to"]
    orig_meta = AIRPORTS_DB.get(orig, {"city": orig, "name": f"{orig} Airport", "region": "Other"})
    dest_meta = AIRPORTS_DB.get(dest, {"city": dest, "name": f"{dest} Airport", "region": "Other"})
    fare = float(spec["baseFare"])
    avg_90d = round(fare * 0.92)

    return RouteInsight(
        id=f"{orig}-{dest}",
        originCode=orig,
        destinationCode=dest,
        originCity=orig_meta["city"],
        destinationCity=dest_meta["city"],
        distanceKm=spec["distanceKm"],
        currentFare=fare,
        currency="INR",
        indexValue=round(120.0 + (fare / 100.0) * 0.15, 1),
        change7dPct=spec["change7d"],
        change30dPct=round(spec["change7d"] * 1.5, 1),
        pressureLevel=spec["pressure"],
        pressureScore=spec["pressureScore"],
        forecastSignal=spec["forecast"],
        avgFare90d=avg_90d,
        lowestFare90d=round(avg_90d * 0.72),
        highestFare90d=round(avg_90d * 1.65),
        bookingVelocityPct=round(24.0 + spec["pressureScore"] * 0.2, 1),
        lastUpdated=datetime.utcnow().isoformat(),
        flights=build_flight_deals_for_spec(spec, fare)
    )


# Build all route insights
ALL_ROUTES: Dict[str, RouteInsight] = {
    f"{s['from']}-{s['to']}": construct_route_insight(s) for s in ROUTE_SPECS
}


@router.get("", response_model=List[RouteInsight])
def list_routes():
    """Lists all monitored domestic Indian flight sectors."""
    return list(ALL_ROUTES.values())


@router.get("/pressure", response_model=List[PricePressureEntry])
def get_price_pressure(db: Session = Depends(get_db)):
    """Returns sorted price pressure hotspots."""
    pressures = db.query(RoutePricePressure).order_by(RoutePricePressure.rank).all()
    if not pressures:
        return [
            {"rank": 1, "routeId": "DEL-BOM", "routeLabel": "DEL → BOM", "pressureLevel": "high", "pressureScore": 92.0, "change7dPct": 12.4, "primaryDriver": "Corporate & Metro Leisure Demand Peak"},
            {"rank": 2, "routeId": "BLR-DEL", "routeLabel": "BLR → DEL", "pressureLevel": "elevated", "pressureScore": 79.0, "change7dPct": 8.8, "primaryDriver": "Tech Corridor Weekly Commute Surge"},
            {"rank": 3, "routeId": "BOM-GOI", "routeLabel": "BOM → GOI", "pressureLevel": "elevated", "pressureScore": 69.0, "change7dPct": 8.1, "primaryDriver": "Long-Weekend Tourist Influx"},
            {"rank": 4, "routeId": "DEL-BLR", "routeLabel": "DEL → BLR", "pressureLevel": "high", "pressureScore": 84.0, "change7dPct": 10.1, "primaryDriver": "Metro Capacity Constraint"},
            {"rank": 5, "routeId": "DEL-HYD", "routeLabel": "DEL → HYD", "pressureLevel": "elevated", "pressureScore": 74.0, "change7dPct": 7.6, "primaryDriver": "Business Travel Escalation"}
        ]
    return [
        {
            "rank": p.rank,
            "routeId": p.route_id,
            "routeLabel": p.route_label,
            "pressureLevel": p.pressure_level,
            "pressureScore": p.pressure_score,
            "change7dPct": p.change_7d_pct,
            "primaryDriver": p.primary_driver
        }
        for p in pressures
    ]


@router.get("/{id}", response_model=RouteInsight)
def get_route(id: str):
    """Returns details for any requested sector, dynamically constructing if necessary."""
    norm_id = id.upper()
    if norm_id in ALL_ROUTES:
        return ALL_ROUTES[norm_id]

    # Dynamic fallback for any valid IATA pair
    parts = norm_id.split("-")
    orig = parts[0] if len(parts) > 0 else "DEL"
    dest = parts[1] if len(parts) > 1 else "BOM"

    dynamic_spec = {
        "from": orig,
        "to": dest,
        "distanceKm": 1050,
        "baseFare": 5400,
        "pressure": "moderate",
        "pressureScore": 55.0,
        "change7d": 4.2,
        "forecast": "stable"
    }
    return construct_route_insight(dynamic_spec)


@router.get("/{id}/fare-trend", response_model=List[FareTrendPoint])
def get_fare_trend(id: str):
    """Returns 30-day historical fare trends for the requested sector."""
    route_obj = get_route(id)
    base_fare = route_obj.currentFare
    today = datetime.utcnow().date()
    points = []

    rng = random.Random(hash_seed(f"trend-{id}"))
    for i in range(30):
        d = today - timedelta(days=29 - i)
        progress = i / 29.0
        wave = math.sin(i * 0.4) * (base_fare * 0.08)
        daily_fare = round((base_fare * (0.90 + progress * 0.10) + wave + rng.uniform(-100, 100)) / 10) * 10
        low_f = round(daily_fare * 0.82 / 10) * 10
        high_f = round(daily_fare * 1.32 / 10) * 10
        ma_f = round(daily_fare * 0.98 / 10) * 10

        points.append(FareTrendPoint(
            date=d.isoformat(),
            avgFare=daily_fare,
            lowestFare=low_f,
            highestFare=high_f,
            movingAvg=ma_f
        ))
    return points


@router.get("/{id}/booking-window", response_model=List[BookingWindowBucket])
def get_booking_window(id: str):
    """Returns advance booking pricing escalation buckets tailored to route."""
    route_obj = get_route(id)
    base = route_obj.currentFare
    return [
        BookingWindowBucket(bucket="0-1 days (Emergency/Walkup)", avgFare=round(base * 1.95 / 10) * 10, sampleCount=280),
        BookingWindowBucket(bucket="2-3 days (Late Business)", avgFare=round(base * 1.45 / 10) * 10, sampleCount=450),
        BookingWindowBucket(bucket="4-7 days (Prime Corporate)", avgFare=round(base * 1.10 / 10) * 10, sampleCount=920),
        BookingWindowBucket(bucket="8-14 days (Standard Leisure)", avgFare=round(base * 0.90 / 10) * 10, sampleCount=1240),
        BookingWindowBucket(bucket="15-30 days (Early Planning)", avgFare=round(base * 0.80 / 10) * 10, sampleCount=890),
        BookingWindowBucket(bucket="30+ days (Advance Super-saver)", avgFare=round(base * 0.72 / 10) * 10, sampleCount=610),
    ]


@router.get("/{id}/fare-composition", response_model=List[FareComponent])
def get_fare_composition(id: str):
    """Returns unbundled price components for requested sector."""
    route_obj = get_route(id)
    total = route_obj.currentFare
    base = round(total * 0.65)
    atf = round(total * 0.19)
    udf = round(total * 0.07)
    psf = round(total * 0.03)
    gst = round(total - (base + atf + udf + psf))

    return [
        FareComponent(component="Base Tariff (Carrier Yield)", amount=base, pct=65.0, color="#0284c7"),
        FareComponent(component="Aviation Turbine Fuel (ATF) Surcharge", amount=atf, pct=19.0, color="#f59e0b"),
        FareComponent(component="User Development Fee (UDF)", amount=udf, pct=7.0, color="#10b981"),
        FareComponent(component="Passenger Service Fee (PSF)", amount=psf, pct=3.0, color="#6366f1"),
        FareComponent(component="GST (Economy 5%) & Statutory Levies", amount=gst, pct=6.0, color="#8b5cf6")
    ]


@router.get("/{id}/comparable-fares", response_model=List[ComparableFare])
def get_comparable_fares(id: str):
    """Returns comparability-engine standardized fares for requested sector."""
    route_obj = get_route(id)
    base = route_obj.currentFare
    return [
        ComparableFare(product="Economy Saver (Normalized Baseline)", cabin="Economy", baggageKg=15.0, refundable=False, stops="non-stop", fare=round(base / 10) * 10, note="Standardized 15kg benchmark baseline"),
        ComparableFare(product="Economy Flexi (Free Date Change)", cabin="Economy", baggageKg=15.0, refundable=True, stops="non-stop", fare=round(base * 1.14 / 10) * 10, note="Includes date change flexibility"),
        ComparableFare(product="Corporate Value Bundle (20kg + Seat)", cabin="Economy", baggageKg=20.0, refundable=True, stops="non-stop", fare=round(base * 1.26 / 10) * 10, note="Normalized for extra baggage & seat select"),
        ComparableFare(product="Connecting 1-Stop Alternative", cabin="Economy", baggageKg=15.0, refundable=False, stops="1 stop", fare=round(base * 0.84 / 10) * 10, note="Discounted 16% vs direct flight equivalent")
    ]
