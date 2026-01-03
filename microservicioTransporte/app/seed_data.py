from __future__ import annotations

from decimal import Decimal
import logging

from sqlalchemy import text
from sqlalchemy.orm import Session

from . import models
from .services.external_schedule import ExternalScheduleError, get_external_card_blocks

LOGGER = logging.getLogger(__name__)


def _coord(lng: float, lat: float) -> tuple[Decimal, Decimal]:
    return (Decimal(str(lng)), Decimal(str(lat)))


STOP_COORDINATES: dict[str, tuple[Decimal, Decimal]] = {
    "L1 Metro Etxebarri": _coord(-2.8967772404717302, 43.24397173609036),
    "L1 Metacal Kalea": _coord(-2.8937088759947267, 43.24492992719602),
    "L1 Doneztebe Eliza": _coord(-2.891122115319937, 43.24598755268646),
    "L1 San Antonio Hiribidea": _coord(-2.8872862407224327, 43.24702874476444),
    "L1 Kukullaga Ikastetxea": _coord(-2.8861488323489226, 43.24901769897248),
    "L1 Kiroldegia": _coord(-2.8841071166975185, 43.25066808714677),
    "L1 Galicia Kalea": _coord(-2.883330180290336, 43.252660853827855),
    "L1 Galicia Kalea 2": _coord(-2.882623819357687, 43.25345316885862),
    "L1 Santa Marina": _coord(-2.883024510937969, 43.255890099999405),
    "L1 IES Etxebarri BHI": _coord(-2.884890897506966, 43.25343406150203),
    "L1 Goiko San Antonio Hiribidea": _coord(-2.8839558722117618, 43.25103331923095),
    "L1 Marivi Iturbe Kalea": _coord(-2.886034033873555, 43.248992351853026),
    "L1 Beheko San Antonio Hiribidea": _coord(-2.8874842700078407, 43.24717715469667),
    "L1 Doneztebe Eliza 2": _coord(-2.8912215474404075, 43.246038806411484),
    "L1 Metacal Kalea 2": _coord(-2.893827387294854, 43.24495873405763),
    "L2 Metro Etxebarri": _coord(-2.8967772404717302, 43.24397173609036),
    "L2 Fuenlabrada Kalea": _coord(-2.8943843007617427, 43.246974801859636),
    "L2 Errota/Molino": _coord(-2.8945549868126155, 43.24877093455157),
    "L2 Zuberoa Kalea": _coord(-2.89462322472418, 43.250428229805784),
    "L2 Lezama Legizamon": _coord(-2.896714203551309, 43.247736109456135),
    "L2 Tomas Meabe": _coord(-2.9001729580517575, 43.24544512460776),
    "L2 Zubialdea (El Boquete)": _coord(-2.904239398789997, 43.24439361613609),
}


def _normalize_time_string(value: str) -> str:
    hours, minutes = value.replace(" ", "").split(":")
    return f"{int(hours):02d}:{int(minutes):02d}"


SCHEDULE_DATA = [
    {
        "idLinea": 1,
        "idParada": 1,
        "tipoDia": "LECTIVO",
        "times": [
            "06:10",
            "06:30",
            "06:50",
            "07:00",
            "07:10",
            "07:20",
            "07:30",
            "07:40",
            "07:45",
            "08:00",
            "08:10",
            "08:20",
            "08:30",
            "08:40",
            "08:45",
            "09:00",
            "09:10",
            "09:20",
            "09:30",
            "09:40",
            "09:50",
            "10:05",
            "10:20",
            "10:35",
            "10:50",
            "11:05",
            "11:20",
            "11:35",
            "11:50",
            "12:05",
            "12:20",
            "12:35",
            "12:50",
            "13:05",
            "13:20",
            "13:35",
            "13:50",
            "14:05",
            "14:20",
            "14:35",
            "14:50",
            "15:05",
            "15:20",
            "15:35",
            "15:50",
            "16:00",
            "16:10",
            "16:20",
            "16:30",
            "16:40",
            "16:50",
            "17:00",
            "17:10",
            "17:20",
            "17:30",
            "17:40",
            "17:50",
            "18:05",
            "18:20",
            "18:35",
            "18:50",
            "19:05",
            "19:20",
            "19:35",
            "19:50",
            "20:05",
            "20:20",
            "20:35",
            "20:50",
            "21:20",
            "21:50",
            "22:20",
            "22:50",
            "23:20",
        ],
    },
    {
        "idLinea": 1,
        "idParada": 1,
        "tipoDia": "NO_LECTIVO",
        "times": [
            "06:10",
            "06:50",
            "07:05",
            "07:20",
            "07:35",
            "07:50",
            "08:05",
            "08:20",
            "08:35",
            "08:50",
            "09:05",
            "09:20",
            "09:35",
            "09:50",
            "10:10",
            "10:30",
            "10:50",
            "11:10",
            "11:30",
            "11:50",
            "12:10",
            "12:30",
            "12:50",
            "13:10",
            "13:30",
            "13:50",
            "14:10",
            "14:30",
            "14:50",
            "15:10",
            "15:30",
            "15:50",
            "16:10",
            "16:30",
            "16:50",
            "17:05",
            "17:20",
            "17:35",
            "17:50",
            "18:05",
            "18:20",
            "18:35",
            "18:50",
            "19:10",
            "19:30",
            "19:50",
            "20:10",
            "20:30",
            "20:50",
            "21:10",
            "21:30",
            "21:50",
            "22:20",
            "22:50",
            "23:20",
        ],
    },
    {
        "idLinea": 1,
        "idParada": 1,
        "tipoDia": "FESTIVO",
        "times": [
            "07:20",
            "07:50",
            "08:20",
            "08:50",
            "09:20",
            "09:50",
            "10:20",
            "10:50",
            "11:20",
            "11:50",
            "12:20",
            "12:50",
            "13:20",
            "13:50",
            "14:20",
            "14:50",
            "15:20",
            "15:50",
            "16:20",
            "16:50",
            "17:20",
            "17:50",
            "18:20",
            "18:50",
            "19:20",
            "19:20",
            "19:50",
            "20:20",
            "20:50",
            "21:20",
            "21:50",
            "22:30",
        ],
    },
]


LINE_DEFINITIONS = [
    {
        "slug": "l1-metro",
        "nomLinea": "Metro",
        "badge": "Linea 1",
        "subtitle": "Metro -> Santa Marina",
        "color": "#0074D9",
        "info": "Conecta el metro con el barrio alto. Ideal en horas punta de la manana.",
        "orden": 1,
        "stops": [
            "L1 Metro Etxebarri",
            "L1 Metacal Kalea",
            "L1 Doneztebe Eliza",
            "L1 San Antonio Hiribidea",
            "L1 Kukullaga Ikastetxea",
            "L1 Kiroldegia",
            "L1 Galicia Kalea",
            "L1 Galicia Kalea 2",
            "L1 Santa Marina",
        ],
    },
    {
        "slug": "l1-santamarina",
        "nomLinea": "Santa Marina",
        "badge": "Linea 1",
        "subtitle": "Santa Marina -> Metro",
        "color": "#FFC107",
        "info": "Recorre el casco urbano y baja hacia el metro pasando por los centros escolares.",
        "orden": 2,
        "stops": [
            "L1 Santa Marina",
            "L1 IES Etxebarri BHI",
            "L1 Goiko San Antonio Hiribidea",
            "L1 Marivi Iturbe Kalea",
            "L1 Beheko San Antonio Hiribidea",
            "L1 Doneztebe Eliza 2",
            "L1 Metacal Kalea 2",
            "L1 Metro Etxebarri",
        ],
    },
    {
        "slug": "l2-labur",
        "nomLinea": "Labur",
        "badge": "Linea 2",
        "subtitle": "Boquete directo",
        "color": "#C6FF00",
        "info": "Version rapida para subir y bajar al Boquete. Enlaza con Metro y lineas comarcales.",
        "orden": 3,
        "stops": [
            "L2 Metro Etxebarri",
            "L2 Fuenlabrada Kalea",
            "L2 Lezama Legizamon",
            "L2 Tomas Meabe",
            "L2 Zubialdea (El Boquete)",
            "L2 Zubialdea (El Boquete)",
            "L2 Tomas Meabe",
            "L2 Lezama Legizamon",
            "L2 Fuenlabrada Kalea",
            "L2 Metro Etxebarri",
        ],
    },
    {
        "slug": "l2-luze",
        "nomLinea": "Luze",
        "badge": "Linea 2",
        "subtitle": "Poligono + Boquete",
        "color": "#1B8F3A",
        "info": "Servicio que enlaza el poligono, los centros educativos y la zona del Boquete sin trasbordos.",
        "orden": 4,
        "stops": [
            "L2 Metro Etxebarri",
            "L2 Fuenlabrada Kalea",
            "L2 Errota/Molino",
            "L2 Zuberoa Kalea",
            "L2 Lezama Legizamon",
            "L2 Tomas Meabe",
            "L2 Zubialdea (El Boquete)",
            "L2 Zubialdea (El Boquete)",
            "L2 Tomas Meabe",
            "L2 Lezama Legizamon",
            "L2 Fuenlabrada Kalea",
            "L2 Metro Etxebarri",
        ],
    },
]


DEFAULT_SCHEDULE_CARDS = [
    {
        "slug": "l1-santa-marina",
        "line_code": "L1",
        "line_name": "Linea 1",
        "line_badge": "Linea 1",
        "line_color": "#0074D9",
        "service_name": "Santa Marina y Metro",
        "description": "Frecuencias oficiales entre Metro Etxebarri y Santa Marina.",
        "line_id": 1,
        "blocks": [
            {
                "title": "Laborables",
                "note": "Tiempos en negrita indican servicio adaptado a dias no lectivos.",
                "columns": [
                    {
                        "label": "Lectivos",
                        "day_type": "LECTIVO",
                    },
                    {
                        "label": "No lectivos",
                        "day_type": "NO_LECTIVO",
                    },
                ],
            },
            {
                "title": "Fines de semana",
                "columns": [
                    {
                        "label": "Santa Marina",
                        "day_type": "FESTIVO",
                    },
                ],
                "note": "Entre salidas se mantiene la frecuencia municipal.",
            },
        ],
    },
    {
        "slug": "l2-poligono-boquete",
        "line_code": "L2",
        "line_name": "Linea 2",
        "line_badge": "Linea 2",
        "line_color": "#1B8F3A",
        "service_name": "Servicio Luze y Labur",
        "description": "Recorridos hacia poligono industrial y barrio del Boquete.",
        "line_id": 4,
        "blocks": [
            {
                "title": "Laborables",
                "subtitle": "Servicio Luze (Poligono + Boquete)",
                "columns": [
                    {
                        "label": "Lectivos (Metro -> Boquete)",
                        "items": [
                            {"start": "06:30", "end": "06:50"},
                            {"start": "06:55", "end": "07:15"},
                            {"start": "08:05", "end": "08:25"},
                            {"start": "08:55", "end": "09:15"},
                            {"start": "09:45", "end": "10:05"},
                            {"start": "12:35", "end": "12:55"},
                            {"start": "13:40", "end": "14:00"},
                            {"start": "14:55", "end": "15:15"},
                            {"start": "16:25", "end": "16:45"},
                            {"start": "16:40", "end": "17:00"},
                            {"start": "17:25", "end": "17:45"},
                            {"start": "17:40", "end": "18:00"},
                            {"start": "18:40", "end": "19:00"},
                            {"start": "19:05", "end": "19:25"},
                            {"start": "19:40", "end": "20:00"},
                            {"start": "19:55", "end": "20:15"},
                        ],
                    },
                    {
                        "label": "No lectivos",
                        "items": [
                            {"start": "06:30", "end": "06:50"},
                            {"start": "07:10", "end": "07:30"},
                            {"start": "07:40", "end": "08:00"},
                            {"start": "08:25", "end": "08:45"},
                            {"start": "09:25", "end": "09:45"},
                            {"start": "10:10", "end": "10:30"},
                            {"start": "11:00", "end": "11:20"},
                            {"start": "12:25", "end": "12:45"},
                            {"start": "13:25", "end": "13:45"},
                            {"start": "14:25", "end": "14:45"},
                            {"start": "15:15", "end": "15:35"},
                            {"start": "16:35", "end": "16:55"},
                            {"start": "17:10", "end": "17:30"},
                            {"start": "18:35", "end": "18:55"},
                            {"start": "19:25", "end": "19:45"},
                            {"start": "19:55", "end": "20:15"},
                        ],
                    },
                ],
                "note": "Recorrido Luze: Metro -> Fuenlabrada -> Poligono -> Boquete -> Metro.",
            },
            {
                "title": "Servicio Labur",
                "subtitle": "Solo laborables",
                "columns": [
                    {
                        "label": "Lectivos",
                        "items": [
                            {"start": "06:55", "end": "07:10", "highlight": True},
                            {"start": "08:05", "end": "08:20"},
                            {"start": "08:15", "end": "08:30", "highlight": True},
                            {"start": "10:15", "end": "10:30"},
                            {"start": "11:15", "end": "11:30", "highlight": True},
                            {"start": "11:55", "end": "12:10"},
                            {"start": "12:40", "end": "12:55", "highlight": True},
                            {"start": "13:30", "end": "13:45"},
                            {"start": "14:10", "end": "14:25", "highlight": True},
                            {"start": "14:35", "end": "14:50"},
                            {"start": "15:10", "end": "15:25", "highlight": True},
                            {"start": "15:25", "end": "15:40"},
                            {"start": "16:20", "end": "16:35", "highlight": True},
                            {"start": "16:40", "end": "16:55"},
                            {"start": "17:40", "end": "17:55"},
                            {"start": "18:15", "end": "18:30"},
                            {"start": "18:55", "end": "19:10", "highlight": True},
                            {"start": "19:40", "end": "19:55"},
                            {"start": "20:10", "end": "20:25"},
                            {"start": "20:25", "end": "20:40"},
                            {"start": "20:55", "end": "21:10"},
                        ],
                    },
                    {
                        "label": "No lectivos",
                        "items": [
                            {"start": "06:30", "end": "06:45"},
                            {"start": "07:10", "end": "07:25"},
                            {"start": "07:40", "end": "07:55"},
                            {"start": "08:25", "end": "08:40"},
                            {"start": "09:25", "end": "09:40"},
                            {"start": "10:10", "end": "10:25"},
                            {"start": "11:00", "end": "11:15"},
                            {"start": "11:40", "end": "11:55"},
                            {"start": "12:25", "end": "12:40"},
                            {"start": "13:25", "end": "13:40"},
                            {"start": "14:25", "end": "14:40"},
                            {"start": "15:15", "end": "15:30"},
                            {"start": "16:35", "end": "16:50"},
                            {"start": "17:10", "end": "17:25"},
                            {"start": "18:10", "end": "18:25"},
                            {"start": "19:25", "end": "19:40"},
                            {"start": "19:55", "end": "20:10"},
                            {"start": "20:40", "end": "20:55"},
                            {"start": "21:05", "end": "21:20"},
                            {"start": "21:45", "end": "22:00"},
                            {"start": "22:20", "end": "22:35"},
                        ],
                    },
                ],
                "note": "En negrita se destacan las expediciones de recorrido corto (Labur).",
            },
        ],
    },
]


def _get_coords(stop_name: str) -> tuple[Decimal | None, Decimal | None]:
    return STOP_COORDINATES.get(stop_name, (None, None))


def seed_lines_and_stops(session: Session) -> None:
    if session.query(models.Line).count():
        return

    for data in LINE_DEFINITIONS:
        line = models.Line(
            slug=data["slug"],
            nomLinea=data["nomLinea"],
            badge=data["badge"],
            subtitle=data["subtitle"],
            info=data["info"],
            color=data["color"],
            orden=data["orden"],
        )
        session.add(line)
        session.flush()

        for order, stop_name in enumerate(data["stops"], start=1):
            coord_x, coord_y = _get_coords(stop_name)
            session.add(
                models.Stop(
                    nombre=stop_name,
                    coordX=coord_x,
                    coordY=coord_y,
                    idLinea=line.idLinea,
                    orden=order,
                )
            )

    session.commit()


def seed_schedule_cards(session: Session) -> None:
    existing_cards = {
        card.slug: card for card in session.query(models.ScheduleCard).all()
    }

    for idx, payload in enumerate(DEFAULT_SCHEDULE_CARDS, start=1):
        card = existing_cards.get(payload["slug"])
        if not card:
            card = models.ScheduleCard(slug=payload["slug"])
            session.add(card)

        card.line_code = payload["line_code"]
        card.line_name = payload["line_name"]
        card.line_badge = payload["line_badge"]
        card.line_color = payload["line_color"]
        card.service_name = payload["service_name"]
        card.description = payload["description"]
        card.blocks = payload["blocks"]
        card.orden = idx
        card.idLinea = payload.get("line_id")

    session.commit()


def seed_schedules(session: Session) -> None:
    session.execute(text('TRUNCATE "horario"'))
    session.commit()


def ensure_schedule_schema(session: Session) -> None:
    session.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS "horario" (
                "idHorario" SERIAL PRIMARY KEY
            );
            """
        )
    )
    session.execute(text('ALTER TABLE "horario" DROP COLUMN IF EXISTS "hora"'))
    session.execute(
        text(
            'ALTER TABLE "horario" '
            'ADD COLUMN IF NOT EXISTS "tipoDia" VARCHAR(20)'
        )
    )
    session.execute(text('ALTER TABLE "horario" DROP COLUMN IF EXISTS "horas"'))
    session.execute(
        text(
            'ALTER TABLE "horario" '
            'ADD COLUMN IF NOT EXISTS "horas" JSONB NOT NULL DEFAULT \'[]\'::jsonb'
        )
    )
    session.execute(text('ALTER TABLE "horario" DROP CONSTRAINT IF EXISTS "horario_tipoDia_key"'))
    session.execute(
        text(
            'ALTER TABLE "horario" '
            'ADD COLUMN IF NOT EXISTS "idLinea" INTEGER REFERENCES "linea"("idLinea")'
        )
    )
    session.execute(
        text(
            'ALTER TABLE "horario" '
            'ADD COLUMN IF NOT EXISTS "idParada" INTEGER REFERENCES "parada"("idParada")'
        )
    )
    session.execute(
        text('ALTER TABLE "horario" ALTER COLUMN "tipoDia" SET NOT NULL')
    )
    session.execute(
        text('DROP INDEX IF EXISTS uq_horario_tipodia')
    )
    session.execute(
        text(
            'CREATE UNIQUE INDEX IF NOT EXISTS uq_horario_linea_parada_tipodia '
            'ON "horario" (COALESCE("idLinea", -1), COALESCE("idParada", -1), UPPER("tipoDia"))'
        )
    )
    session.execute(
        text(
            'ALTER TABLE "horario_card" '
            'ADD COLUMN IF NOT EXISTS "idLinea" INTEGER NULL'
        )
    )
    session.execute(
        text('UPDATE "horario" SET "idLinea" = COALESCE("idLinea", 1)')
    )
    session.execute(
        text('UPDATE "horario" SET "idParada" = COALESCE("idParada", 1)')
    )
    session.commit()


def seed_initial_data(session_factory) -> None:
    session: Session = session_factory()
    try:
        ensure_schedule_schema(session)
        seed_lines_and_stops(session)
        seed_schedules(session)
        seed_schedule_cards(session)
        try:
            get_external_card_blocks(session)
        except ExternalScheduleError as exc:
            LOGGER.warning("No se pudieron sincronizar los horarios oficiales durante el seed: %s", exc)
    finally:
        session.close()
