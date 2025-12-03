from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..crud import create, delete, get_all, get_one, update
from ..database import get_db

router = APIRouter(prefix="/paradas", tags=["Paradas"])


def _ensure_line_exists(db: Session, line_id: int) -> None:
    if not get_one(db, models.Line, line_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La linea indicada no existe")


def _get_stop_or_404(stop_id: int, db: Session) -> models.Stop:
    parada = get_one(db, models.Stop, stop_id)
    if not parada:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parada no encontrada")
    return parada


@router.get("/", response_model=list[schemas.Stop])
def list_stops(db: Session = Depends(get_db)):
    return get_all(db, models.Stop)


@router.get("/{stop_id}", response_model=schemas.Stop)
def retrieve_stop(stop_id: int, db: Session = Depends(get_db)):
    return _get_stop_or_404(stop_id, db)


@router.post("/", response_model=schemas.Stop, status_code=status.HTTP_201_CREATED)
def create_stop(payload: schemas.StopCreate, db: Session = Depends(get_db)):
    _ensure_line_exists(db, payload.idLinea)
    return create(db, models.Stop, payload.model_dump())


@router.put("/{stop_id}", response_model=schemas.Stop)
def update_stop(stop_id: int, payload: schemas.StopUpdate, db: Session = Depends(get_db)):
    parada = _get_stop_or_404(stop_id, db)
    data = payload.model_dump(exclude_unset=True)
    if "idLinea" in data and data["idLinea"] is not None:
        _ensure_line_exists(db, data["idLinea"])
    if not data:
        return parada
    return update(db, parada, data)


@router.delete("/{stop_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_stop(stop_id: int, db: Session = Depends(get_db)):
    parada = _get_stop_or_404(stop_id, db)
    delete(db, parada)