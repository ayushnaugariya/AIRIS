"""
Router for Route insights, fare trend curves, booking windows, fare composition, and price pressure.
"""
from datetime import datetime, timedelta
from typing import List
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
)

router = APIRouter(prefix="/api/v1/routes", tags=["Routes"])

# Mock database of representative trunk routes
ROUTES_DB = [
    {
        "id": "DEL-BOM",
        "originCode": "DEL",
        "destinationCode": "BOM",
        "originCity": "Delhi",
        "destinationCity": "Mumbai",
        "distanceKm": 1148,
        "currentFare": 5840,
        "currency": "INR",
        "indexValue": 129.8,
        "change7dPct": 6.8,
        "change30dPct": 11.2,
        "pressureLevel": "high",
        "pressureScore": 88.5,
        "forecastSignal": "rising",
        "avgFare90d": 4920,
        "lowestFare90d": 3450,
        "highestFare90d": 12800,
        "bookingVelocityPct": 28.4,
        "lastUpdated": datetime.utcnow().isoformat(),
        "flights": [
            {
                "flightNo": "6E-2134",
                "airline": "IndiGo",
                "aircraft": "A321neo",
                "depTime": "06:15",
                "arrTime": "08:30",
                "durationLabel": "2h 15m",
                "quotes": [
                    {"source": "Airline direct", "fare": 5420},
                    {"source": "MakeMyTrip", "fare": 5490},
                    {"source": "Cleartrip", "fare": 5460},
                    {"source": "EaseMyTrip", "fare": 5390}
                ],
                "bestFare": 5390,
                "bestSource": "EaseMyTrip"
            },
            {
                "flightNo": "AI-805",
                "airline": "Air India",
                "aircraft": "B787-8",
                "depTime": "07:00",
                "arrTime": "09:15",
                "durationLabel": "2h 15m",
                "quotes": [
                    {"source": "Airline direct", "fare": 5980},
                    {"source": "MakeMyTrip", "fare": 6050},
                    {"source": "Cleartrip", "fare": 6010},
                    {"source": "EaseMyTrip", "fare": 5950}
                ],
                "bestFare": 5950,
                "bestSource": "EaseMyTrip"
            },
            {
                "flightNo": "UK-975",
                "airline": "Vistara",
                "aircraft": "A320neo",
                "depTime": "08:45",
                "arrTime": "11:00",
                "durationLabel": "2h 15m",
                "quotes": [
                    {"source": "Airline direct", "fare": 6350},
                    {"source": "MakeMyTrip", "fare": 6420},
                    {"source": "Cleartrip", "fare": 6390},
                    {"source": "EaseMyTrip", "fare": 6310}
                ],
                "bestFare": 6310,
                "bestSource": "EaseMyTrip"
            },
            {
                "flightNo": "QP-1302",
                "airline": "Akasa Air",
                "aircraft": "B737-MAX",
                "depTime": "10:30",
                "arrTime": "12:45",
                "durationLabel": "2h 15m",
                "quotes": [
                    {"source": "Airline direct", "fare": 4980},
                    {"source": "MakeMyTrip", "fare": 5040},
                    {"source": "Cleartrip", "fare": 5010},
                    {"source": "EaseMyTrip", "fare": 4950}
                ],
                "bestFare": 4950,
                "bestSource": "EaseMyTrip"
            }
        ]
    },
    {
        "id": "DEL-BLR",
        "originCode": "DEL",
        "destinationCode": "BLR",
        "originCity": "Delhi",
        "destinationCity": "Bengaluru",
        "distanceKm": 1709,
        "currentFare": 6450,
        "currency": "INR",
        "indexValue": 126.4,
        "change7dPct": 4.5,
        "change30dPct": 8.9,
        "pressureLevel": "elevated",
        "pressureScore": 76.0,
        "forecastSignal": "rising",
        "avgFare90d": 5600,
        "lowestFare90d": 4100,
        "highestFare90d": 14200,
        "bookingVelocityPct": 22.0,
        "lastUpdated": datetime.utcnow().isoformat(),
        "flights": [
            {
                "flightNo": "6E-5021",
                "airline": "IndiGo",
                "aircraft": "A321neo",
                "depTime": "07:30",
                "arrTime": "10:15",
                "durationLabel": "2h 45m",
                "quotes": [
                    {"source": "Airline direct", "fare": 6200},
                    {"source": "MakeMyTrip", "fare": 6280},
                    {"source": "Cleartrip", "fare": 6240},
                    {"source": "EaseMyTrip", "fare": 6180}
                ],
                "bestFare": 6180,
                "bestSource": "EaseMyTrip"
            },
            {
                "flightNo": "AI-503",
                "airline": "Air India",
                "aircraft": "A320neo",
                "depTime": "09:15",
                "arrTime": "12:00",
                "durationLabel": "2h 45m",
                "quotes": [
                    {"source": "Airline direct", "fare": 6750},
                    {"source": "MakeMyTrip", "fare": 6820},
                    {"source": "Cleartrip", "fare": 6790},
                    {"source": "EaseMyTrip", "fare": 6710}
                ],
                "bestFare": 6710,
                "bestSource": "EaseMyTrip"
            }
        ]
    },
    {
        "id": "BOM-BLR",
        "originCode": "BOM",
        "destinationCode": "BLR",
        "originCity": "Mumbai",
        "destinationCity": "Bengaluru",
        "distanceKm": 842,
        "currentFare": 3950,
        "currency": "INR",
        "indexValue": 108.2,
        "change7dPct": -1.8,
        "change30dPct": 0.5,
        "pressureLevel": "low",
        "pressureScore": 38.0,
        "forecastSignal": "stable",
        "avgFare90d": 4120,
        "lowestFare90d": 2890,
        "highestFare90d": 8900,
        "bookingVelocityPct": 14.5,
        "lastUpdated": datetime.utcnow().isoformat(),
        "flights": [
            {
                "flightNo": "6E-442",
                "airline": "IndiGo",
                "aircraft": "A320neo",
                "depTime": "08:00",
                "arrTime": "09:40",
                "durationLabel": "1h 40m",
                "quotes": [
                    {"source": "Airline direct", "fare": 3850},
                    {"source": "MakeMyTrip", "fare": 3910},
                    {"source": "Cleartrip", "fare": 3880},
                    {"source": "EaseMyTrip", "fare": 3820}
                ],
                "bestFare": 3820,
                "bestSource": "EaseMyTrip"
            }
        ]
    },
    {
        "id": "BOM-GOI",
        "originCode": "BOM",
        "destinationCode": "GOI",
        "originCity": "Mumbai",
        "destinationCity": "Goa",
        "distanceKm": 435,
        "currentFare": 4820,
        "currency": "INR",
        "indexValue": 138.5,
        "change7dPct": 22.4,
        "change30dPct": 34.0,
        "pressureLevel": "high",
        "pressureScore": 92.1,
        "forecastSignal": "rising",
        "avgFare90d": 3350,
        "lowestFare90d": 2100,
        "highestFare90d": 11500,
        "bookingVelocityPct": 42.8,
        "lastUpdated": datetime.utcnow().isoformat(),
        "flights": [
            {
                "flightNo": "6E-341",
                "airline": "IndiGo",
                "aircraft": "A320neo",
                "depTime": "11:20",
                "arrTime": "12:35",
                "durationLabel": "1h 15m",
                "quotes": [
                    {"source": "Airline direct", "fare": 4650},
                    {"source": "MakeMyTrip", "fare": 4720},
                    {"source": "Cleartrip", "fare": 4680},
                    {"source": "EaseMyTrip", "fare": 4620}
                ],
                "bestFare": 4620,
                "bestSource": "EaseMyTrip"
            }
        ]
    },
    {
        "id": "DEL-CCU",
        "originCode": "DEL",
        "destinationCode": "CCU",
        "originCity": "Delhi",
        "destinationCity": "Kolkata",
        "distanceKm": 1305,
        "currentFare": 5480,
        "currency": "INR",
        "indexValue": 121.8,
        "change7dPct": 2.1,
        "change30dPct": 5.4,
        "pressureLevel": "moderate",
        "pressureScore": 58.0,
        "forecastSignal": "stable",
        "avgFare90d": 5200,
        "lowestFare90d": 3800,
        "highestFare90d": 10800,
        "bookingVelocityPct": 16.0,
        "lastUpdated": datetime.utcnow().isoformat(),
        "flights": []
    }
]


@router.get("", response_model=List[RouteInsight])
def list_routes():
    """Lists all monitored trunk and regional routes with market summaries."""
    return ROUTES_DB


@router.get("/pressure", response_model=List[PricePressureEntry])
def get_price_pressure(db: Session = Depends(get_db)):
    """Returns sorted price pressure hotspots."""
    pressures = db.query(RoutePricePressure).order_by(RoutePricePressure.rank).all()
    if not pressures:
        return [
            {"rank": 1, "routeId": "DEL-BOM", "routeLabel": "DEL → BOM", "pressureLevel": "high", "pressureScore": 88.5, "change7dPct": 14.2, "primaryDriver": "Corporate & Metro Leisure Demand Peak"},
            {"rank": 2, "routeId": "BLR-DEL", "routeLabel": "BLR → DEL", "pressureLevel": "elevated", "pressureScore": 76.0, "change7dPct": 9.8, "primaryDriver": "Tech Corridor Weekly Commute Surge"},
            {"rank": 3, "routeId": "BOM-GOI", "routeLabel": "BOM → GOI", "pressureLevel": "high", "pressureScore": 92.1, "change7dPct": 22.4, "primaryDriver": "Long-Weekend Tourist Influx"}
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
    """Returns details for a specific route."""
    for r in ROUTES_DB:
        if r["id"].upper() == id.upper():
            return r
    return ROUTES_DB[0]


@router.get("/{id}/fare-trend", response_model=List[FareTrendPoint])
def get_fare_trend(id: str):
    """Returns 30-day historical fare trends for a route."""
    today = datetime.utcnow().date()
    points = []
    base_fare = 5200.0 if "DEL" in id.upper() else 4200.0

    for i in range(30):
        d = today - timedelta(days=29 - i)
        variation = (i * 24.0) + (180.0 if i % 7 in (5, 6) else -60.0)
        avg_f = round(base_fare + variation, 2)
        low_f = round(avg_f * 0.82, 2)
        high_f = round(avg_f * 1.35, 2)
        ma_f = round(avg_f * 0.98, 2)

        points.append({
            "date": d.isoformat(),
            "avgFare": avg_f,
            "lowestFare": low_f,
            "highestFare": high_f,
            "movingAvg": ma_f
        })
    return points


@router.get("/{id}/booking-window", response_model=List[BookingWindowBucket])
def get_booking_window(id: str):
    """Returns fare escalation by advance booking window."""
    return [
        {"bucket": "0-1 days (Emergency/Walkup)", "avgFare": 11450, "sampleCount": 240},
        {"bucket": "2-3 days (Late Business)", "avgFare": 8620, "sampleCount": 420},
        {"bucket": "4-7 days (Prime Corporate)", "avgFare": 6480, "sampleCount": 890},
        {"bucket": "8-14 days (Standard Leisure)", "avgFare": 5120, "sampleCount": 1150},
        {"bucket": "15-30 days (Early Planning)", "avgFare": 4450, "sampleCount": 980},
        {"bucket": "30+ days (Advance Super-saver)", "avgFare": 3980, "sampleCount": 650}
    ]


@router.get("/{id}/fare-composition", response_model=List[FareComponent])
def get_fare_composition(id: str):
    """Returns breakdown of ticket price components."""
    return [
        {"component": "Base Tariff (Carrier Yield)", "amount": 3850, "pct": 66.0, "color": "#0284c7"},
        {"component": "Aviation Turbine Fuel (ATF) Surcharge", "amount": 1100, "pct": 18.8, "color": "#f59e0b"},
        {"component": "User Development Fee (UDF)", "amount": 420, "pct": 7.2, "color": "#10b981"},
        {"component": "Passenger Service Fee (PSF)", "amount": 180, "pct": 3.1, "color": "#6366f1"},
        {"component": "GST (Economy 5%) & Regulatory Taxes", "amount": 290, "pct": 4.9, "color": "#8b5cf6"}
    ]


@router.get("/{id}/comparable-fares", response_model=List[ComparableFare])
def get_comparable_fares(id: str):
    """Returns comparability-engine standardized fares."""
    return [
        {"product": "Economy Saver (Standardized Baseline)", "cabin": "Economy", "baggageKg": 15, "refundable": False, "stops": "non-stop", "fare": 5420, "note": "Normalized benchmark index baseline"},
        {"product": "Economy Flexi (Free Date Change)", "cabin": "Economy", "baggageKg": 15, "refundable": True, "stops": "non-stop", "fare": 6150, "note": "Includes date flexibility adjustment"},
        {"product": "Corporate Value Bundle (20kg + Seat)", "cabin": "Economy", "baggageKg": 20, "refundable": True, "stops": "non-stop", "fare": 6890, "note": "Normalized for extra baggage & seat select"},
        {"product": "Connecting 1-Stop Alternative", "cabin": "Economy", "baggageKg": 15, "refundable": False, "stops": "1 stop", "fare": 4680, "note": "Discounted 14% vs direct equivalent"}
    ]
