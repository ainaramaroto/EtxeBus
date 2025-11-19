from __future__ import annotations

from fastapi import Depends, FastAPI, HTTPException, Query
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .config import get_settings
from .database import engine, get_session
from .seed_data import seed_initial_data

app = FastAPI(title="Microservicio Transporte", version="1.0.0")
settings = get_settings()


@app.on_event("startup")
def startup_event() -> None:
    models.Base.metadata.create_all(bind=engine)
    with get_session() as session:
        seed_initial_data(session)


def get_db():
    with get_session() as session:
        yield session


def _serialize_line(line: models.Line, include_stops: bool) -> schemas.Line:
    stops = None
    if include_stops:
        stops = [
            schemas.LineStop(
                stop_id=ls.stop_id,
                sequence=ls.sequence,
                travel_minutes=ls.travel_minutes,
                stop=schemas.Stop.model_validate(ls.stop),
            )
            for ls in line.stops
        ]
    return schemas.Line(
        id=line.id,
        code=line.code,
        name=line.name,
        description=line.description,
        color=line.color,
        headway_minutes=line.headway_minutes,
        stops=stops,
    )


@app.get("/", summary="Información del servicio")
def root() -> dict:
    return {
        "name": settings.app_name,
        "description": "API para consulta de líneas, paradas y tiempos estimados de EtxeBus",
    }


@app.get("/health", summary="Estado del servicio")
def health() -> dict:
    return {"status": "ok"}


@app.get("/lines", response_model=list[schemas.Line])
def read_lines(
    include_stops: bool = Query(False, description="Incluir el listado completo de paradas"),
    db: Session = Depends(get_db),
):
    lines = crud.list_lines(db, include_stops=include_stops)
    return [_serialize_line(line, include_stops) for line in lines]


@app.get("/lines/{line_id}", response_model=schemas.Line)
def read_line(line_id: int, db: Session = Depends(get_db)):
    line = crud.get_line(db, line_id)
    if not line:
        raise HTTPException(status_code=404, detail="Línea no encontrada")
    return _serialize_line(line, include_stops=True)


@app.get("/stops", response_model=list[schemas.Stop])
def read_stops(db: Session = Depends(get_db)):
    return [schemas.Stop.model_validate(stop) for stop in crud.list_stops(db)]


@app.get("/stops/{stop_id}", response_model=schemas.Stop)
def read_stop(stop_id: int, db: Session = Depends(get_db)):
    stop = crud.get_stop(db, stop_id)
    if not stop:
        raise HTTPException(status_code=404, detail="Parada no encontrada")
    return schemas.Stop.model_validate(stop)


@app.get("/stops/{stop_id}/arrivals", response_model=list[schemas.ArrivalEstimate])
def arrival_estimates(stop_id: int, line_id: int | None = None, db: Session = Depends(get_db)):
    items = crud.get_arrivals(db, stop_id=stop_id, line_id=line_id)
    if not items:
        raise HTTPException(status_code=404, detail="No hay información para la parada solicitada")
    return [
        schemas.ArrivalEstimate(
            line_id=item["line"].id,
            line_code=item["line"].code,
            stop_id=item["stop"].id,
            upcoming_times=item["times"],
        )
        for item in items
    ]


@app.get("/journeys", response_model=schemas.JourneyPlan)
def journey_plan(origin_stop_id: int, destination_stop_id: int, db: Session = Depends(get_db)):
    plan = crud.plan_journey(db, origin_stop_id, destination_stop_id)
    if not plan:
        raise HTTPException(status_code=404, detail="No se encontró un trayecto directo entre las paradas")

    steps = [
        schemas.JourneyStep(
            line_id=step["line"].id,
            line_code=step["line"].code,
            from_stop=schemas.Stop.model_validate(step["from"]),
            to_stop=schemas.Stop.model_validate(step["to"]),
            travel_minutes=step["travel_minutes"],
            direction=step["direction"],
        )
        for step in plan["steps"]
    ]

    return schemas.JourneyPlan(
        origin=schemas.Stop.model_validate(plan["origin"]),
        destination=schemas.Stop.model_validate(plan["destination"]),
        total_minutes=plan["total_minutes"],
        steps=steps,
    )
