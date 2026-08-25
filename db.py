"""
Storage layer. Uses SQLite by default so the whole pipeline runs with zero
external services — swap DATABASE_URL for Postgres in production
(the schema is intentionally simple enough that nothing else changes).
"""
from __future__ import annotations
import os
from datetime import datetime, date

from sqlalchemy import create_engine, String, Float, Boolean, DateTime, Date, Integer
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session

DATABASE_URL = os.environ.get("AIRIS_DB_URL", "sqlite:///airis_fares.db")


class Base(DeclarativeBase):
    pass


class FareRecord(Base):
    __tablename__ = "fare_observations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    origin: Mapped[str] = mapped_column(String(3), index=True)
    destination: Mapped[str] = mapped_column(String(3), index=True)
    airline: Mapped[str] = mapped_column(String(10))
    flight_number: Mapped[str | None] = mapped_column(String(10), nullable=True)
    travel_date: Mapped[date] = mapped_column(Date, index=True)
    cabin_class: Mapped[str] = mapped_column(String(20))
    is_direct: Mapped[bool] = mapped_column(Boolean)

    base_fare: Mapped[float] = mapped_column(Float)
    taxes_fees: Mapped[float] = mapped_column(Float)
    total_fare: Mapped[float] = mapped_column(Float, index=True)

    source: Mapped[str] = mapped_column(String(50), index=True)
    scraped_at: Mapped[datetime] = mapped_column(DateTime)
    raw_payload_hash: Mapped[str] = mapped_column(String(32))

    confidence_score: Mapped[float] = mapped_column(Float, default=0.0)
    validation_status: Mapped[str] = mapped_column(String(50), default="pending")

    # rejected observations are stored too — for audit, not for index use.
    # this is the "missing beats wrong" principle: nothing silently vanishes.
    accepted: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    rejection_reason: Mapped[str | None] = mapped_column(String(100), nullable=True)


_engine = create_engine(DATABASE_URL, echo=False)


def init_db():
    Base.metadata.create_all(_engine)


def get_session() -> Session:
    return Session(_engine)


def route_fare_history(session: Session, origin: str, destination: str, limit: int = 200) -> list[float]:
    rows = (
        session.query(FareRecord.total_fare)
        .filter(FareRecord.origin == origin, FareRecord.destination == destination, FareRecord.accepted.is_(True))
        .order_by(FareRecord.scraped_at.desc())
        .limit(limit)
        .all()
    )
    return [r[0] for r in rows]
