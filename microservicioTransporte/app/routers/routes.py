from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..crud import create, delete, get_all, get_one, update
from ..database import get_db

router = APIRouter(prefix="/trayectos", tags=["Trayectos"])


def _ensure_stop(db: Session, stop_id: int) -> None:
    if not get_one(db, models.Stop, stop_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La parada indicada no existe")


def _get_route_or_404(route_id: int, db: Session) -> models.Route:
    route = get_one(db, models.Route, route_id)
    if not route:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trayecto no encontrado")
    return route


@router.get("/", response_model=list[schemas.Route])
def list_routes(db: Session = Depends(get_db)):
    return get_all(db, models.Route)


@router.get("/{route_id}", response_model=schemas.Route)
def retrieve_route(route_id: int, db: Session = Depends(get_db)):
    return _get_route_or_404(route_id, db)


@router.post("/", response_model=schemas.Route, status_code=status.HTTP_201_CREATED)
def create_route(payload: schemas.RouteCreate, db: Session = Depends(get_db)):
    _ensure_stop(db, payload.idOrigen)
    _ensure_stop(db, payload.idDestino)
    return create(db, models.Route, payload.model_dump())


@router.put("/{route_id}", response_model=schemas.Route)
def update_route(route_id: int, payload: schemas.RouteUpdate, db: Session = Depends(get_db)):
    route = _get_route_or_404(route_id, db)
    data = payload.model_dump(exclude_unset=True)
    if "idOrigen" in data and data["idOrigen"] is not None:
        _ensure_stop(db, data["idOrigen"])
    if "idDestino" in data and data["idDestino"] is not None:
        _ensure_stop(db, data["idDestino"])
    if not data:
        return route
    return update(db, route, data)


@router.delete("/{route_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_route(route_id: int, db: Session = Depends(get_db)):
    route = _get_route_or_404(route_id, db)
    delete(db, route)