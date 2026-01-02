from __future__ import annotations

from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..crud import create, delete, get_all, get_one, update
from ..database import get_db

router = APIRouter(prefix="/horarios", tags=["Horarios"])


def _format_hour_value(value: str) -> str:
    raw = value.strip()
    if ":" not in raw:
        return raw
    hours, minutes = raw.split(":")
    return f"{int(hours):02d}:{int(minutes):02d}"


def _build_schedule_map(db: Session, line_id: int) -> dict[str, list[dict]]:
    records = (
        db.query(models.Schedule.tipoDia, models.Schedule.hora)
        .filter(models.Schedule.idLinea == line_id)
        .order_by(models.Schedule.hora)
        .all()
    )
    mapping: dict[str, list[dict]] = defaultdict(list)
    for tipo, hour in records:
        mapping[tipo.upper()].append({"start": _format_hour_value(hour)})
    return mapping


def _ensure_line(db: Session, line_id: int) -> None:
    if not get_one(db, models.Line, line_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La linea indicada no existe")


def _ensure_stop(db: Session, stop_id: int) -> None:
    if not get_one(db, models.Stop, stop_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La parada indicada no existe")


def _get_schedule_or_404(schedule_id: int, db: Session) -> models.Schedule:
    schedule = get_one(db, models.Schedule, schedule_id)
    if not schedule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Horario no encontrado")
    return schedule


@router.get("/", response_model=list[schemas.Schedule])
def list_schedules(
    line_id: int | None = None,
    stop_id: int | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Schedule)
    if line_id is not None:
        query = query.filter(models.Schedule.idLinea == line_id)
    if stop_id is not None:
        query = query.filter(models.Schedule.idParada == stop_id)
    return query.all()


@router.get("/publicados", response_model=list[schemas.PublishedSchedule])
def list_published_schedules(db: Session = Depends(get_db)):
    cards = (
        db.query(models.ScheduleCard)
        .order_by(models.ScheduleCard.orden, models.ScheduleCard.id)
        .all()
    )

    enriched: list[schemas.PublishedSchedule] = []
    for card in cards:
        schedule_map = _build_schedule_map(db, card.idLinea) if card.idLinea else {}
        new_blocks: list[schemas.ScheduleBlock] = []
        for block in card.blocks or []:
            new_columns = []
            for column in block.get("columns", []):
                column_copy = {k: v for k, v in column.items() if k not in {"items", "day_type"}}
                day_type = column.get("day_type")
                if day_type and schedule_map:
                    items = [item.copy() for item in schedule_map.get(day_type.upper(), [])]
                else:
                    items = column.get("items", [])
                column_copy["items"] = items
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
    _ensure_line(db, payload.idLinea)
    _ensure_stop(db, payload.idParada)
    return create(db, models.Schedule, payload.model_dump())


@router.put("/{schedule_id}", response_model=schemas.Schedule)
def update_schedule(schedule_id: int, payload: schemas.ScheduleUpdate, db: Session = Depends(get_db)):
    schedule = _get_schedule_or_404(schedule_id, db)
    data = payload.model_dump(exclude_unset=True)
    if "idLinea" in data and data["idLinea"] is not None:
        _ensure_line(db, data["idLinea"])
    if "idParada" in data and data["idParada"] is not None:
        _ensure_stop(db, data["idParada"])
    if not data:
        return schedule
    return update(db, schedule, data)


@router.delete("/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_schedule(schedule_id: int, db: Session = Depends(get_db)):
    schedule = _get_schedule_or_404(schedule_id, db)
    delete(db, schedule)
