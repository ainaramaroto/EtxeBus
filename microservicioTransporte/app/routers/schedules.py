from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..crud import create, delete, get_one, update
from ..database import get_db
from ..services.external_schedule import (
    ExternalScheduleError,
    get_external_card_blocks,
)

router = APIRouter(prefix="/horarios", tags=["Horarios"])
LOGGER = logging.getLogger(__name__)


def _format_hour_value(value: str) -> str:
    raw = value.strip()
    if ":" not in raw:
        return raw
    hours, minutes = raw.split(":", 1)
    return f"{int(hours):02d}:{int(minutes):02d}"


def _normalize_hours_list(hours: list[str]) -> list[str]:
    sanitized = {_format_hour_value(hour) for hour in hours if hour}
    return sorted(sanitized)


def _get_schedule_or_404(schedule_id: int, db: Session) -> models.Schedule:
    schedule = get_one(db, models.Schedule, schedule_id)
    if not schedule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Horario no encontrado")
    return schedule


@router.get("/", response_model=list[schemas.Schedule])
def list_schedules(
    tipo_dia: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Schedule)
    if tipo_dia is not None:
        query = query.filter(models.Schedule.tipoDia == tipo_dia.upper())
    return query.order_by(models.Schedule.tipoDia).all()


@router.get("/publicados", response_model=list[schemas.PublishedSchedule])
def list_published_schedules(db: Session = Depends(get_db)):
    cards = (
        db.query(models.ScheduleCard)
        .order_by(models.ScheduleCard.orden, models.ScheduleCard.id)
        .all()
    )

    try:
        external_blocks = get_external_card_blocks(db)
    except ExternalScheduleError as exc:
        LOGGER.warning("No se pudieron cargar los horarios oficiales ni recuperar copias: %s", exc)
        external_blocks = {}

    enriched: list[schemas.PublishedSchedule] = []
    for card in cards:
        new_blocks: list[schemas.ScheduleBlock] = []

        if external_blocks.get(card.slug):
            for block in external_blocks[card.slug]:
                new_blocks.append(schemas.ScheduleBlock.model_validate(block))
        else:
            for block in card.blocks or []:
                new_columns = []
                for column in block.get("columns", []):
                    column_copy = dict(column)
                    column_copy["items"] = column.get("items", [])
                    new_columns.append(column_copy)
                block_copy = dict(block)
                block_copy["columns"] = new_columns
                new_blocks.append(schemas.ScheduleBlock.model_validate(block_copy))

        enriched.append(
            schemas.PublishedSchedule(
                slug=card.slug,
                line_code=card.line_code,
                line_name=card.line_name,
                line_badge=card.line_badge,
                line_color=card.line_color,
                service_name=card.service_name,
                description=card.description,
                orden=card.orden,
                blocks=new_blocks,
                line_id=card.idLinea,
            )
        )

    return enriched


@router.get("/{schedule_id}", response_model=schemas.Schedule)
def retrieve_schedule(schedule_id: int, db: Session = Depends(get_db)):
    return _get_schedule_or_404(schedule_id, db)


@router.post("/", response_model=schemas.Schedule, status_code=status.HTTP_201_CREATED)
def create_schedule(payload: schemas.ScheduleCreate, db: Session = Depends(get_db)):
    data = payload.model_dump()
    data["tipoDia"] = data["tipoDia"].upper()
    data["horas"] = _normalize_hours_list(data["horas"])
    return create(db, models.Schedule, data)


@router.put("/{schedule_id}", response_model=schemas.Schedule)
def update_schedule(schedule_id: int, payload: schemas.ScheduleUpdate, db: Session = Depends(get_db)):
    schedule = _get_schedule_or_404(schedule_id, db)
    data = payload.model_dump(exclude_unset=True)
    if "tipoDia" in data and data["tipoDia"] is not None:
        data["tipoDia"] = data["tipoDia"].upper()
    if "horas" in data and data["horas"] is not None:
        data["horas"] = _normalize_hours_list(data["horas"])
    if not data:
        return schedule
    return update(db, schedule, data)


@router.delete("/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_schedule(schedule_id: int, db: Session = Depends(get_db)):
    schedule = _get_schedule_or_404(schedule_id, db)
    delete(db, schedule)
