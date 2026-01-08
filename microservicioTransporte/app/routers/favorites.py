from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..crud import create, delete
from ..database import get_db

router = APIRouter(prefix="/favoritos", tags=["Favoritos"])


@router.get("/", response_model=list[schemas.FavoriteTrip])
def list_favorites(
    usuario: str = Query(..., min_length=1, max_length=50),
    contrasenia: str = Query(..., min_length=1, max_length=50),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.FavoriteTrip)
        .filter(
            models.FavoriteTrip.usuario == usuario,
            models.FavoriteTrip.contrasenia == contrasenia,
        )
        .order_by(models.FavoriteTrip.created_at.desc())
        .all()
    )


@router.post("/", response_model=schemas.FavoriteTrip, status_code=status.HTTP_201_CREATED)
def create_favorite(payload: schemas.FavoriteTripCreate, db: Session = Depends(get_db)):
    existing = (
        db.query(models.FavoriteTrip)
        .filter(
            models.FavoriteTrip.usuario == payload.usuario,
            models.FavoriteTrip.contrasenia == payload.contrasenia,
            models.FavoriteTrip.origin_slug == payload.origin_slug,
            models.FavoriteTrip.destination_slug == payload.destination_slug,
        )
        .first()
    )
    if existing:
        return existing
    return create(db, models.FavoriteTrip, payload.model_dump())


@router.delete("/{favorite_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_favorite(
    favorite_id: int,
    usuario: str = Query(..., min_length=1, max_length=50),
    contrasenia: str = Query(..., min_length=1, max_length=50),
    db: Session = Depends(get_db),
):
    favorito = (
        db.query(models.FavoriteTrip)
        .filter(
            models.FavoriteTrip.idFavorito == favorite_id,
            models.FavoriteTrip.usuario == usuario,
            models.FavoriteTrip.contrasenia == contrasenia,
        )
        .first()
    )
    if not favorito:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Favorito no encontrado")
    delete(db, favorito)
