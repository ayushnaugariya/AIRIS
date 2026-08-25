"""
Database seeding module for AIRIS.
Populates initial rich anomalies, routes, data sources, and baseline observations.
"""
from datetime import datetime, timedelta
from backend.app.database import SessionLocal, init_db
from backend.app.models import AnomalyRecord, RoutePricePressure, DataSourceRecordModel, FareObservation


def seed_database():
    init_db()
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(AnomalyRecord).first() is not None:
            return

        # 1. Seed Anomalies
        anomalies_data = [
            {
                "id": "anom-1",
                "detected_at": datetime.utcnow() - timedelta(minutes=14),
                "time_label": "14:32",
                "day_label": "Today",
                "route_id": "DEL-BOM",
                "route_label": "DEL → BOM",
                "index_change_pct": 18.5,
                "expected_pct": 2.1,
                "actual_pct": 18.5,
                "deviation_pp": 16.4,
                "severity": "critical",
                "status": "open",
                "explanation": "Severe price spike detected across evening non-stop flights. 3 of 4 operating carriers simultaneously raised economy buckets.",
                "contributors": [
                    {"factor": "Carrier Coordinated Shift", "impactPct": 58, "detail": "IndiGo and Air India raised bucket T within 12 minutes of each other."},
                    {"factor": "Long Weekend Surge", "impactPct": 27, "detail": "Outbound leisure demand 3.4x higher than standard Tuesday baseline."},
                    {"factor": "ATF Pass-through", "impactPct": 15, "detail": "Monthly fuel surcharge adjustment indexed into base fares."}
                ],
                "confidence_pct": 96.2,
                "fare_move_inr": 2450.0,
                "flights_in_scope": ["6E-2134", "AI-805", "UK-975", "QP-1302"]
            },
            {
                "id": "anom-2",
                "detected_at": datetime.utcnow() - timedelta(minutes=48),
                "time_label": "13:58",
                "day_label": "Today",
                "route_id": "BLR-DEL",
                "route_label": "BLR → DEL",
                "index_change_pct": 14.2,
                "expected_pct": 3.4,
                "actual_pct": 14.2,
                "deviation_pp": 10.8,
                "severity": "high",
                "status": "open",
                "explanation": "Unusual midday tariff inflation across non-stop services; corporate return corridor capacity tightened.",
                "contributors": [
                    {"factor": "Corporate Demand Surge", "impactPct": 52, "detail": "Early morning and late evening corporate bookings surged 42%."},
                    {"factor": "Capacity Restriction", "impactPct": 33, "detail": "1 daily frequency grounded for scheduled maintenance."},
                    {"factor": "OTA Markups", "impactPct": 15, "detail": "Convenience fee differentials elevated across two major portals."}
                ],
                "confidence_pct": 91.8,
                "fare_move_inr": 1820.0,
                "flights_in_scope": ["6E-5021", "AI-503", "UK-812"]
            },
            {
                "id": "anom-3",
                "detected_at": datetime.utcnow() - timedelta(hours=3),
                "time_label": "11:15",
                "day_label": "Today",
                "route_id": "BOM-GOI",
                "route_label": "BOM → GOI",
                "index_change_pct": 22.8,
                "expected_pct": 4.0,
                "actual_pct": 22.8,
                "deviation_pp": 18.8,
                "severity": "critical",
                "status": "acknowledged",
                "explanation": "Holiday corridor weekend surge: coastal leisure traffic driving rapid depletion of low fare tiers.",
                "contributors": [
                    {"factor": "Weekend Leisure Peak", "impactPct": 70, "detail": "Friday evening departures sold out 9 days in advance."},
                    {"factor": "Dynamic Yield Escalation", "impactPct": 30, "detail": "Automated RM system jumped 4 fare tiers within 2 hours."}
                ],
                "confidence_pct": 98.4,
                "fare_move_inr": 3100.0,
                "flights_in_scope": ["6E-341", "AI-661", "QP-114"]
            }
        ]

        for a in anomalies_data:
            db.add(AnomalyRecord(**a))

        # 2. Seed Price Pressures
        pressures = [
            {"rank": 1, "route_id": "DEL-BOM", "route_label": "DEL → BOM", "pressure_level": "high", "pressure_score": 88.5, "change_7d_pct": 14.2, "primary_driver": "Corporate & Metro Leisure Demand Peak"},
            {"rank": 2, "route_id": "BLR-DEL", "route_label": "BLR → DEL", "pressure_level": "elevated", "pressure_score": 76.0, "change_7d_pct": 9.8, "primary_driver": "Tech Corridor Weekly Commute Surge"},
            {"rank": 3, "route_id": "BOM-GOI", "route_label": "BOM → GOI", "pressure_level": "high", "pressure_score": 92.1, "change_7d_pct": 22.4, "primary_driver": "Long-Weekend Tourist Influx"},
            {"rank": 4, "route_id": "DEL-BLR", "route_label": "DEL → BLR", "pressure_level": "moderate", "pressure_score": 64.2, "change_7d_pct": 5.1, "primary_driver": "Capacity Normalization"},
            {"rank": 5, "route_id": "BOM-BLR", "route_label": "BOM → BLR", "pressure_level": "low", "pressure_score": 38.0, "change_7d_pct": -1.8, "primary_driver": "High Frequency Competitive Pricing"}
        ]
        for p in pressures:
            db.add(RoutePricePressure(**p))

        # 3. Seed Data Sources
        sources = [
            {"id": "src-6e", "name": "IndiGo Direct (API & Portal)", "url": "https://www.goindigo.in", "category": "airline", "status": "connected", "last_ingestion_minutes_ago": 2, "records_today": 42500, "data_quality_pct": 99.4, "latency_ms": 142},
            {"id": "src-ai", "name": "Air India Direct (API)", "url": "https://www.airindia.com", "category": "airline", "status": "connected", "last_ingestion_minutes_ago": 3, "records_today": 31200, "data_quality_pct": 98.8, "latency_ms": 185},
            {"id": "src-amadeus", "name": "Amadeus GDS Global Distribution", "url": "https://api.amadeus.com", "category": "airline", "status": "connected", "last_ingestion_minutes_ago": 1, "records_today": 89000, "data_quality_pct": 99.9, "latency_ms": 95},
            {"id": "src-mmt", "name": "MakeMyTrip OTA Feed", "url": "https://www.makemytrip.com", "category": "ota", "status": "connected", "last_ingestion_minutes_ago": 4, "records_today": 56000, "data_quality_pct": 97.2, "latency_ms": 310},
            {"id": "src-ct", "name": "Cleartrip OTA Feed", "url": "https://www.cleartrip.com", "category": "ota", "status": "connected", "last_ingestion_minutes_ago": 5, "records_today": 38400, "data_quality_pct": 96.8, "latency_ms": 280},
            {"id": "src-emt", "name": "EaseMyTrip OTA Feed", "url": "https://www.easemytrip.com", "category": "ota", "status": "degraded", "last_ingestion_minutes_ago": 12, "records_today": 24000, "data_quality_pct": 94.1, "latency_ms": 620}
        ]
        for s in sources:
            db.add(DataSourceRecordModel(**s))

        # 4. Seed initial Observations
        sample_obs = [
            FareObservation(
                origin_code="DEL", destination_code="BOM", airline_code="6E", flight_number="6E-2134",
                source_platform="IndiGo Direct", departure_timestamp=datetime.utcnow() + timedelta(days=7, hours=6),
                raw_fare_amount=5420.0, base_fare=4590.0, taxes_and_fees=830.0, standardized_fare=5420.0,
                baggage_allowance_kg=15.0, is_direct=True, fare_class="Economy", quality_score=1.0,
                confidence_score=0.96, validation_status="ok", accepted=True
            ),
            FareObservation(
                origin_code="DEL", destination_code="BOM", airline_code="AI", flight_number="AI-805",
                source_platform="Air India Direct", departure_timestamp=datetime.utcnow() + timedelta(days=7, hours=8),
                raw_fare_amount=5980.0, base_fare=5060.0, taxes_and_fees=920.0, standardized_fare=5980.0,
                baggage_allowance_kg=25.0, is_direct=True, fare_class="Economy", quality_score=1.0,
                confidence_score=0.98, validation_status="ok", accepted=True
            ),
            FareObservation(
                origin_code="BLR", destination_code="DEL", airline_code="6E", flight_number="6E-5021",
                source_platform="MakeMyTrip", departure_timestamp=datetime.utcnow() + timedelta(days=5, hours=9),
                raw_fare_amount=6100.0, base_fare=5160.0, taxes_and_fees=940.0, standardized_fare=6100.0,
                baggage_allowance_kg=15.0, is_direct=True, fare_class="Economy", quality_score=1.0,
                confidence_score=0.94, validation_status="ok", accepted=True
            )
        ]
        for o in sample_obs:
            db.add(o)

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()
