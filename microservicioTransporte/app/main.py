from __future__ import annotations

from fastapi import FastAPI

from .config import get_settings
from .database import init_db
from .routers import lines, stops, routes, route_stops, schedules

settings = get_settings()
app = FastAPI(title=settings.app_name)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/", summary="Estado del servicio")
def read_root():
    return {"service": settings.app_name, "status": "ok"}


app.include_router(lines.router)
app.include_router(stops.router)
app.include_router(routes.router)
app.include_router(route_stops.router)
app.include_router(schedules.router)
