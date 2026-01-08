from __future__ import annotations

import logging

from fastapi import FastAPI

from .config import get_settings
from .database import SessionLocal, init_db
from .routers import lines, stops, routes, route_stops, schedules, favorites
from .services.external_schedule import ExternalScheduleError, get_external_card_blocks

settings = get_settings()
app = FastAPI(title=settings.app_name)
LOGGER = logging.getLogger(__name__)


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    session = SessionLocal()
    try:
        get_external_card_blocks(session)
    except ExternalScheduleError as exc:
        LOGGER.warning("No se pudieron sincronizar los horarios oficiales en el arranque: %s", exc)
    finally:
        session.close()


@app.get("/", summary="Estado del servicio")
def read_root():
    return {"service": settings.app_name, "status": "ok"}


app.include_router(lines.router)
app.include_router(stops.router)
app.include_router(routes.router)
app.include_router(route_stops.router)
app.include_router(schedules.router)
app.include_router(favorites.router)
