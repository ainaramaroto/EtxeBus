from __future__ import annotations

from decimal import Decimal
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, JSON, Numeric, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship, synonym

from .database import Base


class Line(Base):
    __tablename__ = "linea"

    idLinea: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nomLineaCom: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    nomLinea: Mapped[str] = mapped_column(String(40))
    linea: Mapped[str | None] = mapped_column(String(20), nullable=True)
    descLinea: Mapped[str | None] = mapped_column(String(120), nullable=True)
    info: Mapped[str | None] = mapped_column(String(300), nullable=True)
    color: Mapped[str | None] = mapped_column(String(10), nullable=True)
    orden: Mapped[int] = mapped_column(default=0)

    # Compatibilidad hacia atras con el contrato previo.
    slug = synonym("nomLineaCom")
    badge = synonym("linea")
    subtitle = synonym("descLinea")

    paradas: Mapped[list["Stop"]] = relationship(
        back_populates="linea",
        cascade="all, delete-orphan",
        order_by="Stop.orden",
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
    idLinea: Mapped[int | None] = mapped_column(ForeignKey("linea.idLinea"), nullable=True)
    idParada: Mapped[int | None] = mapped_column(ForeignKey("parada.idParada"), nullable=True)
    tipoDia: Mapped[str] = mapped_column(String(20))
    horas: Mapped[list[str]] = mapped_column(JSON, default=list)


class ScheduleCard(Base):
    __tablename__ = "horario_publicado"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nomLineaCom: Mapped[str] = mapped_column(String(64), unique=True)
    codLinea: Mapped[str] = mapped_column(String(20))
    nomLinea: Mapped[str] = mapped_column(String(60))
    lin: Mapped[str] = mapped_column(String(20))
    colorLinea: Mapped[str] = mapped_column(String(12))
    servicioLinea: Mapped[str] = mapped_column(String(120))
    desc: Mapped[str | None] = mapped_column(String(200), nullable=True)
    bloques: Mapped[list[dict]] = mapped_column(JSON)
    orden: Mapped[int] = mapped_column(default=0)
    idLinea: Mapped[int | None] = mapped_column(ForeignKey("linea.idLinea"), nullable=True)

    # Compatibilidad hacia atras con el contrato previo.
    slug = synonym("nomLineaCom")
    line_code = synonym("codLinea")
    lineCode = synonym("codLinea")
    line_name = synonym("nomLinea")
    line_badge = synonym("lin")
    line_color = synonym("colorLinea")
    service_name = synonym("servicioLinea")
    description = synonym("desc")
    blocks = synonym("bloques")

    linea: Mapped["Line"] = relationship()


class ExternalScheduleSnapshot(Base):
    __tablename__ = "horario_reserva"

    nomLineaCom: Mapped[str] = mapped_column(String(64), primary_key=True)
    datos: Mapped[list[dict]] = mapped_column(JSON)
    act: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Compatibilidad hacia atras con el contrato previo.
    slug = synonym("nomLineaCom")
    payload = synonym("datos")
    fetched_at = synonym("act")


class FavoriteTrip(Base):
    __tablename__ = "favorito_trayecto"
    __table_args__ = (
        UniqueConstraint(
            "usuario",
            "contrasenia",
            "paradaOrigen",
            "paradaDestino",
            name="uq_favorito_usuario_trayecto",
        ),
    )

    idFavorito: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    usuario: Mapped[str] = mapped_column(String(50))
    contrasenia: Mapped[str] = mapped_column(String(50))
    paradaOrigen: Mapped[str] = mapped_column(String(80))
    paradaDestino: Mapped[str] = mapped_column(String(80))
    nomParadaOrigen: Mapped[str] = mapped_column(String(120))
    nomParadaDestino: Mapped[str] = mapped_column(String(120))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Compatibilidad hacia atras con el contrato previo.
    origin_slug = synonym("paradaOrigen")
    destination_slug = synonym("paradaDestino")
    origin_label = synonym("nomParadaOrigen")
    destination_label = synonym("nomParadaDestino")
