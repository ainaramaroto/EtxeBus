from __future__ import annotations

from decimal import Decimal

from sqlalchemy import Float, ForeignKey, JSON, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class Line(Base):
    __tablename__ = "linea"

    idLinea: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    slug: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    nomLinea: Mapped[str] = mapped_column(String(40))
    badge: Mapped[str | None] = mapped_column(String(20), nullable=True)
    subtitle: Mapped[str | None] = mapped_column(String(120), nullable=True)
    info: Mapped[str | None] = mapped_column(String(300), nullable=True)
    color: Mapped[str | None] = mapped_column(String(10), nullable=True)
    orden: Mapped[int] = mapped_column(default=0)

    paradas: Mapped[list["Stop"]] = relationship(
        back_populates="linea",
        cascade="all, delete-orphan",
        order_by="Stop.orden",
    )
    horarios: Mapped[list["Schedule"]] = relationship(
        back_populates="linea",
        cascade="all, delete-orphan",
    )


class Stop(Base):
    __tablename__ = "parada"

    idParada: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(80))
    coordX: Mapped[Decimal | None] = mapped_column(Numeric(10, 6), nullable=True)
    coordY: Mapped[Decimal | None] = mapped_column(Numeric(10, 6), nullable=True)
    idLinea: Mapped[int] = mapped_column(ForeignKey("linea.idLinea"))
    orden: Mapped[int | None] = mapped_column(nullable=True)

    linea: Mapped["Line"] = relationship(back_populates="paradas")
    horarios: Mapped[list["Schedule"]] = relationship(back_populates="parada")
    trayectos_relacionados: Mapped[list["RouteStop"]] = relationship(back_populates="parada")


class Route(Base):
    __tablename__ = "trayecto"

    idTrayecto: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    idOrigen: Mapped[int] = mapped_column(ForeignKey("parada.idParada"))
    idDestino: Mapped[int] = mapped_column(ForeignKey("parada.idParada"))
    duracionEstm: Mapped[float | None] = mapped_column(Float(2), nullable=True)

    origen: Mapped["Stop"] = relationship(foreign_keys=[idOrigen])
    destino: Mapped["Stop"] = relationship(foreign_keys=[idDestino])
    paradas: Mapped[list["RouteStop"]] = relationship(
        back_populates="trayecto",
        cascade="all, delete-orphan",
    )


class RouteStop(Base):
    __tablename__ = "trayecto_parada"
    __table_args__ = (UniqueConstraint("idTrayecto", "idParada", name="uq_trayecto_parada"),)

    idTrayecto: Mapped[int] = mapped_column(ForeignKey("trayecto.idTrayecto"), primary_key=True)
    idParada: Mapped[int] = mapped_column(ForeignKey("parada.idParada"), primary_key=True)
    orden: Mapped[int | None] = mapped_column(nullable=True)

    trayecto: Mapped["Route"] = relationship(back_populates="paradas")
    parada: Mapped["Stop"] = relationship(back_populates="trayectos_relacionados")


class Schedule(Base):
    __tablename__ = "horario"

    idHorario: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    hora: Mapped[float] = mapped_column(Float(2))
    idLinea: Mapped[int] = mapped_column(ForeignKey("linea.idLinea"))
    idParada: Mapped[int] = mapped_column(ForeignKey("parada.idParada"))

    linea: Mapped["Line"] = relationship(back_populates="horarios")
    parada: Mapped["Stop"] = relationship(back_populates="horarios")


class ScheduleCard(Base):
    __tablename__ = "horario_card"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    slug: Mapped[str] = mapped_column(String(64), unique=True)
    line_code: Mapped[str] = mapped_column(String(20))
    line_name: Mapped[str] = mapped_column(String(60))
    line_badge: Mapped[str] = mapped_column(String(20))
    line_color: Mapped[str] = mapped_column(String(12))
    service_name: Mapped[str] = mapped_column(String(120))
    description: Mapped[str | None] = mapped_column(String(200), nullable=True)
    blocks: Mapped[list[dict]] = mapped_column(JSON)
    orden: Mapped[int] = mapped_column(default=0)
