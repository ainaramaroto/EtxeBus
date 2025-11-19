from __future__ import annotations

from datetime import datetime, timedelta
from math import ceil
from typing import List, Optional

from zoneinfo import ZoneInfo
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from .config import get_settings
from . import models

settings = get_settings()
try:
    TZ = ZoneInfo(settings.timezone)
except Exception:  # pragma: no cover - fallback
    TZ = ZoneInfo("UTC")


# === Consulta de líneas y paradas ===

def list_lines(session: Session, include_stops: bool = False) -> List[models.Line]:
    stmt = select(models.Line)
    if include_stops:
        stmt = stmt.options(joinedload(models.Line.stops).joinedload(models.LineStop.stop))
    return session.execute(stmt).scalars().all()


def get_line(session: Session, line_id: int) -> Optional[models.Line]:
    stmt = (
        select(models.Line)
        .options(joinedload(models.Line.stops).joinedload(models.LineStop.stop))
        .where(models.Line.id == line_id)
    )
    return session.execute(stmt).scalar_one_or_none()


def list_stops(session: Session) -> List[models.Stop]:
    return session.execute(select(models.Stop)).scalars().all()


def get_stop(session: Session, stop_id: int) -> Optional[models.Stop]:
    return session.get(models.Stop, stop_id)


# === Llegadas estimadas ===

def _next_arrival_times(line: models.Line, travel_minutes: int, count: int = 3) -> List[datetime]:
    headway = line.headway_minutes or settings.default_headway_minutes
    now = datetime.now(TZ)
    start = now.replace(
        hour=settings.service_start_hour,
        minute=0,
        second=0,
        microsecond=0,
    )
    if now < start:
        start -= timedelta(days=1)

    minutes_since_start = (now - start).total_seconds() / 60
    next_slot = ceil((minutes_since_start - travel_minutes) / headway)
    if next_slot < 0:
        next_slot = 0

    arrivals = []
    for offset in range(count):
        minutes = travel_minutes + (next_slot + offset) * headway
        arrivals.append(start + timedelta(minutes=minutes))
    return arrivals


def get_arrivals(session: Session, stop_id: int, line_id: Optional[int] = None) -> List[dict]:
    stmt = (
        select(models.LineStop)
        .join(models.Line)
        .where(models.LineStop.stop_id == stop_id)
    )
    if line_id:
        stmt = stmt.where(models.LineStop.line_id == line_id)
    stmt = stmt.options(joinedload(models.LineStop.line), joinedload(models.LineStop.stop))

    results = session.execute(stmt).scalars().all()
    arrivals = []
    for ls in results:
        arrivals.append(
            {
                "line": ls.line,
                "stop": ls.stop,
                "times": _next_arrival_times(ls.line, ls.travel_minutes),
            }
        )
    return arrivals


# === Planificación de trayectos ===

def plan_journey(session: Session, origin_id: int, destination_id: int) -> Optional[dict]:
    origin = session.get(models.Stop, origin_id)
    destination = session.get(models.Stop, destination_id)
    if not origin or not destination:
        return None

    lines_stmt = select(models.Line).options(joinedload(models.Line.stops).joinedload(models.LineStop.stop))
    for line in session.execute(lines_stmt).scalars():
        stops = {ls.stop_id: ls for ls in line.stops}
        if origin_id in stops and destination_id in stops:
            origin_ls = stops[origin_id]
            dest_ls = stops[destination_id]
            direction = "ida" if origin_ls.sequence < dest_ls.sequence else "vuelta"
            travel = abs(dest_ls.travel_minutes - origin_ls.travel_minutes)
            ordered = sorted(
                [origin_ls, dest_ls],
                key=lambda x: x.sequence,
            )
            return {
                "origin": origin,
                "destination": destination,
                "total_minutes": max(travel, 1),
                "steps": [
                    {
                        "line": line,
                        "from": ordered[0].stop,
                        "to": ordered[1].stop,
                        "direction": direction,
                        "travel_minutes": max(travel, 1),
                    }
                ],
            }
    return None
