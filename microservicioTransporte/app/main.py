from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from .config import get_settings
from .database import SessionLocal, init_db
from .routers import lines, stops, routes, route_stops, schedules, favorites
from .services.external_schedule import ExternalScheduleError, get_external_card_blocks

settings = get_settings()
LOGGER = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    session = SessionLocal()
    try:
        get_external_card_blocks(session)
    except ExternalScheduleError as exc:
        LOGGER.warning("No se pudieron sincronizar los horarios oficiales en el arranque: %s", exc)
    finally:
        session.close()
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)


@app.get("/", summary="Estado del servicio")
def read_root():
    return {"service": settings.app_name, "status": "ok"}


@app.get("/health", summary="Health check del servicio")
def read_health():
    return {"status": "ok", "service": settings.app_name}


app.include_router(lines.router)
app.include_router(stops.router)
app.include_router(routes.router)
app.include_router(route_stops.router)
app.include_router(schedules.router)
app.include_router(favorites.router)
