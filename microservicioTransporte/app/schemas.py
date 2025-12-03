from __future__ import annotations

from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class LineBase(BaseModel):
    nomLinea: str
    color: str | None = None


class LineCreate(LineBase):
    pass


class LineUpdate(BaseModel):
    nomLinea: str | None = None
    color: str | None = None


class Line(LineBase):
    idLinea: int

    model_config = ConfigDict(from_attributes=True)


class StopBase(BaseModel):
    nombre: str
    coordX: Decimal | None = None
    coordY: Decimal | None = None
    idLinea: int


class StopCreate(StopBase):
    pass


class StopUpdate(BaseModel):
    nombre: str | None = None
    coordX: Decimal | None = None
    coordY: Decimal | None = None
    idLinea: int | None = None


class Stop(StopBase):
    idParada: int

    model_config = ConfigDict(from_attributes=True)


class RouteBase(BaseModel):
    idOrigen: int
    idDestino: int
    duracionEstm: float | None = None


class RouteCreate(RouteBase):
    pass


class RouteUpdate(BaseModel):
    idOrigen: int | None = None
    idDestino: int | None = None
    duracionEstm: float | None = None


class Route(RouteBase):
    idTrayecto: int

    model_config = ConfigDict(from_attributes=True)


class RouteStopBase(BaseModel):
    idTrayecto: int
    idParada: int
    orden: int | None = None


class RouteStopCreate(RouteStopBase):
    pass


class RouteStopUpdate(BaseModel):
    idTrayecto: int | None = None
    idParada: int | None = None
    orden: int | None = None


class RouteStop(RouteStopBase):
    model_config = ConfigDict(from_attributes=True)


class ScheduleBase(BaseModel):
    hora: float
    idLinea: int
    idParada: int


class ScheduleCreate(ScheduleBase):
    pass


class ScheduleUpdate(BaseModel):
    hora: float | None = None
    idLinea: int | None = None
    idParada: int | None = None


class Schedule(ScheduleBase):
    idHorario: int

    model_config = ConfigDict(from_attributes=True)


class ScheduleSlot(BaseModel):
    start: str
    end: str | None = None
    highlight: bool = False
    note: str | None = None


class ScheduleColumn(BaseModel):
    label: str
    note: str | None = None
    items: list[ScheduleSlot]


class ScheduleBlock(BaseModel):
    title: str
    subtitle: str | None = None
    note: str | None = None
    columns: list[ScheduleColumn]


class PublishedSchedule(BaseModel):
    slug: str
    line_code: str
    line_name: str
    line_badge: str
    line_color: str
    service_name: str
    description: str | None = None
    orden: int
    blocks: list[ScheduleBlock]

    model_config = ConfigDict(from_attributes=True)
