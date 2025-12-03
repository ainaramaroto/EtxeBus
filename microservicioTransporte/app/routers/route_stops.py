from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..crud import create, delete, get_one, update
from ..database import get_db

router = APIRouter(prefix="/trayectos-paradas", tags=["Trayecto-Parada"])


def _ensure_entities(db: Session, route_id: int, stop_id: int) -> None:
    if not get_one(db, models.Route, route_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El trayecto indicado no existe")
    if not get_one(db, models.Stop, stop_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La parada indicada no existe")


def _get_pair_or_404(route_id: int, stop_id: int, db: Session) -> models.RouteStop:
    route_stop = db.get(models.RouteStop, (route_id, stop_id))
    if not route_stop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Relacion no encontrada")
    return route_stop


@router.get("/", response_model=list[schemas.RouteStop])
def list_route_stops(
    route_id: int | None = None,
    stop_id: int | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.RouteStop)
    if route_id is not None:
        query = query.filter(models.RouteStop.idTrayecto == route_id)
    if stop_id is not None:
        query = query.filter(models.RouteStop.idParada == stop_id)
    return query.all()


@router.get("/{route_id}/{stop_id}", response_model=schemas.RouteStop)
def retrieve_route_stop(route_id: int, stop_id: int, db: Session = Depends(get_db)):
    return _get_pair_or_404(route_id, stop_id, db)


@router.post("/", response_model=schemas.RouteStop, status_code=status.HTTP_201_CREATED)
def create_route_stop(payload: schemas.RouteStopCreate, db: Session = Depends(get_db)):
    _ensure_entities(db, payload.idTrayecto, payload.idParada)
    return create(db, models.RouteStop, payload.model_dump())


@router.put("/{route_id}/{stop_id}", response_model=schemas.RouteStop)
def update_route_stop(
    route_id: int,
    stop_id: int,
    payload: schemas.RouteStopUpdate,
    db: Session = Depends(get_db),
):
    route_stop = _get_pair_or_404(route_id, stop_id, db)
    data = payload.model_dump(exclude_unset=True)
    if "idTrayecto" in data and data["idTrayecto"] != route_id:
        _ensure_entities(db, data["idTrayecto"], route_stop.idParada)
    if "idParada" in data and data["idParada"] != stop_id:
        _ensure_entities(db, route_stop.idTrayecto, data["idParada"])
    if not data:
        return route_stop
    return update(db, route_stop, data)


@router.delete("/{route_id}/{stop_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_route_stop(route_id: int, stop_id: int, db: Session = Depends(get_db)):
    route_stop = _get_pair_or_404(route_id, stop_id, db)
    delete(db, route_stop)
