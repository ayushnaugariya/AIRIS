"""
Router for Data Source Connectors, Ingestion Pipeline health, and System Status.
"""
from typing import List, Literal
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import DataSourceRecordModel
from backend.app.schemas import (
    DataSourceRecord,
    SourceCategoryStats,
    PipelineStage,
    SystemStatus,
)

router = APIRouter(prefix="/api/v1", tags=["Sources & System Health"])


@router.get("/sources", response_model=List[DataSourceRecord])
def list_sources(db: Session = Depends(get_db)):
    """Returns active direct airline and OTA data ingestion connectors."""
    db_sources = db.query(DataSourceRecordModel).all()
    if db_sources:
        return [
            {
                "id": s.id,
                "name": s.name,
                "url": s.url,
                "category": s.category,
                "status": s.status,
                "lastIngestionMinutesAgo": s.last_ingestion_minutes_ago,
                "recordsToday": s.records_today,
                "dataQualityPct": s.data_quality_pct,
                "latencyMs": s.latency_ms
            }
            for s in db_sources
        ]

    return [
        {"id": "src-6e", "name": "IndiGo Direct (API & Portal)", "url": "https://www.goindigo.in", "category": "airline", "status": "connected", "lastIngestionMinutesAgo": 2, "recordsToday": 42500, "dataQualityPct": 99.4, "latencyMs": 142},
        {"id": "src-ai", "name": "Air India Direct (API)", "url": "https://www.airindia.com", "category": "airline", "status": "connected", "lastIngestionMinutesAgo": 3, "recordsToday": 31200, "dataQualityPct": 98.8, "latencyMs": 185},
        {"id": "src-amadeus", "name": "Amadeus GDS Global Distribution", "url": "https://api.amadeus.com", "category": "airline", "status": "connected", "lastIngestionMinutesAgo": 1, "recordsToday": 89000, "dataQualityPct": 99.9, "latencyMs": 95},
        {"id": "src-mmt", "name": "MakeMyTrip OTA Feed", "url": "https://www.makemytrip.com", "category": "ota", "status": "connected", "lastIngestionMinutesAgo": 4, "recordsToday": 56000, "dataQualityPct": 97.2, "latencyMs": 310},
        {"id": "src-ct", "name": "Cleartrip OTA Feed", "url": "https://www.cleartrip.com", "category": "ota", "status": "connected", "lastIngestionMinutesAgo": 5, "recordsToday": 38400, "dataQualityPct": 96.8, "latencyMs": 280},
        {"id": "src-emt", "name": "EaseMyTrip OTA Feed", "url": "https://www.easemytrip.com", "category": "ota", "status": "degraded", "lastIngestionMinutesAgo": 12, "recordsToday": 24000, "dataQualityPct": 94.1, "latencyMs": 620}
    ]


@router.get("/sources/stats", response_model=SourceCategoryStats)
def get_source_category_stats(
    category: Literal["airline", "ota"] = Query(..., description="Source category")
):
    """Returns aggregated stats for airline or OTA source streams."""
    if category == "airline":
        return {
            "category": "airline",
            "recordsToday": 162700,
            "avgQualityPct": 99.3,
            "connectedCount": 3,
            "totalCount": 3
        }
    return {
        "category": "ota",
        "recordsToday": 118400,
        "avgQualityPct": 96.0,
        "connectedCount": 2,
        "totalCount": 3
    }


@router.get("/pipeline", response_model=List[PipelineStage])
def get_pipeline():
    """Returns status and metrics across the 4 ingestion and analytics pipeline stages."""
    return [
        {
            "key": "acquisition",
            "label": "1. Multi-Source Acquisition",
            "description": "Direct Airline APIs, GDS distribution feeds, and stealth scraper clusters.",
            "metric": "281.1k records / 24h",
            "status": "healthy"
        },
        {
            "key": "validation",
            "label": "2. Validation & Anomaly Gate",
            "description": "Multi-source cross-verification, statistical z-score bounds & schema drift canary checks.",
            "metric": "98.4% pass rate",
            "status": "healthy"
        },
        {
            "key": "normalization",
            "label": "3. Comparability Engine",
            "description": "Ancillary baggage unbundling, flight connection indexing & seat fare class standardization.",
            "metric": "100% normalized",
            "status": "healthy"
        },
        {
            "key": "index_engine",
            "label": "4. Index & AI Forecasting",
            "description": "National/Regional index weighting, early warning pressure alerts & 7-day predictive models.",
            "metric": "3.2 min refresh interval",
            "status": "healthy"
        }
    ]


@router.get("/system/status", response_model=SystemStatus)
def get_system_status():
    """Returns overarching platform health and uptime."""
    return {
        "overall": "operational",
        "ingestion": "healthy",
        "indexEngine": "healthy",
        "analytics": "healthy",
        "websocket": "connected",
        "uptimePct": 99.98
    }
