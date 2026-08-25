"""
AIRIS FastAPI Backend Server.
Provides complete REST API endpoints, AI Analytics, Comparability Engine, and WebSocket live feeds.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.database import init_db
from backend.app.seed import seed_database
from backend.app.routers import (
    indices,
    routes,
    fares,
    anomalies,
    forecasts,
    sources,
    scraper,
    ws,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database and seed initial dataset
    init_db()
    seed_database()
    yield
    # Shutdown logic if needed


app = FastAPI(
    title="AIRIS - AI-Powered Real-Time Airfare Intelligence System API",
    description="Backend API service for Laspeyres/Jevons Airfare Indices, Comparability Engine, AI Anomaly Detection, and Scraping Pipelines.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration to allow local Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all Routers
app.include_router(indices.router)
app.include_router(routes.router)
app.include_router(fares.router)
app.include_router(anomalies.router)
app.include_router(forecasts.router)
app.include_router(sources.router)
app.include_router(scraper.router)
app.include_router(ws.router)


@app.get("/", tags=["Health"])
def root():
    return {
        "service": "AIRIS Backend API",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
