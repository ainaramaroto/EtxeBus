from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..crud import create, delete, get_all, get_one, update
from ..database import get_db

router = APIRouter(prefix="/lineas", tags=["Lineas"])


@router.get("/", response_model=list[schemas.Line])
def list_lines(db: Session = Depends(get_db)):
    return get_all(db, models.Line)


@router.get("/{line_id}", response_model=schemas.Line)
def retrieve_line(line_id: int, db: Session = Depends(get_db)):
    line = get_one(db, models.Line, line_id)
    if not line:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Linea no encontrada")
    return line


@router.post("/", response_model=schemas.Line, status_code=status.HTTP_201_CREATED)
def create_line(payload: schemas.LineCreate, db: Session = Depends(get_db)):
    return create(db, models.Line, payload.model_dump())


@router.put("/{line_id}", response_model=schemas.Line)
def update_line(line_id: int, payload: schemas.LineUpdate, db: Session = Depends(get_db)):
    line = retrieve_line(line_id, db)
    data = payload.model_dump(exclude_unset=True)
    if not data:
        return line
    return update(db, line, data)


@router.delete("/{line_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_line(line_id: int, db: Session = Depends(get_db)):
    line = retrieve_line(line_id, db)
    delete(db, line)