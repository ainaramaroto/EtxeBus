from __future__ import annotations

from sqlalchemy.orm import Session

from . import models

DEFAULT_SCHEDULE_CARDS = [
    {
        "slug": "l1-santa-marina",
        "line_code": "L1",
        "line_name": "Linea 1",
        "line_badge": "Linea 1",
        "line_color": "#0074D9",
        "service_name": "Santa Marina y Metro",
        "description": "Frecuencias oficiales entre Metro Etxebarri y Santa Marina.",
        "blocks": [
            {
                "title": "Laborables",
                "note": "Tiempos en negrita indican servicio adaptado a dias no lectivos.",
                "columns": [
                    {
                        "label": "Lectivos",
                        "items": [
                            {"start": "06:00", "end": "06:10"},
                            {"start": "07:00", "end": "07:10"},
                            {"start": "08:30", "end": "08:40"},
                            {"start": "13:00", "end": "13:10"},
                            {"start": "18:30", "end": "18:40"},
                        ],
                    },
                    {
                        "label": "No lectivos",
                        "items": [
                            {"start": "06:30", "end": "06:40", "highlight": True},
                            {"start": "07:30", "end": "07:40", "highlight": True},
                            {"start": "09:00", "end": "09:10"},
                            {"start": "13:30", "end": "13:40"},
                            {"start": "19:00", "end": "19:10"},
                        ],
                    },
                ],
            },
            {
                "title": "Fines de semana",
                "columns": [
                    {
                        "label": "Santa Marina",
                        "items": [
                            {"start": "07:00"},
                            {"start": "10:20"},
                            {"start": "13:40"},
                            {"start": "17:10"},
                            {"start": "20:30"},
                        ],
                    },
                    {
                        "label": "Metro",
                        "items": [
                            {"start": "07:10"},
                            {"start": "10:30"},
                            {"start": "13:50"},
                            {"start": "17:20"},
                            {"start": "20:40"},
                        ],
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
        "blocks": [
            {
                "title": "Laborables",
                "subtitle": "Servicio Luze (Poligono + Boquete)",
                "columns": [
                    {
                        "label": "Lectivos (Metro → Boquete)",
                        "items": [
                            {"start": "06:30", "end": "06:55"},
                            {"start": "07:30", "end": "07:55"},
                            {"start": "10:25", "end": "10:55"},
                            {"start": "12:40", "end": "13:10"},
                            {"start": "16:40", "end": "17:10"},
                            {"start": "19:40", "end": "20:10"},
                        ],
                    },
                    {
                        "label": "No lectivos",
                        "items": [
                            {"start": "07:00", "end": "07:25"},
                            {"start": "09:30", "end": "09:55"},
                            {"start": "12:00", "end": "12:30"},
                            {"start": "15:10", "end": "15:40"},
                            {"start": "18:20", "end": "18:50"},
                            {"start": "21:00", "end": "21:30"},
                        ],
                    },
                ],
                "note": "Recorrido Luze: Metro → Fuenlabrada → Poligono → Boquete → Metro.",
            },
            {
                "title": "Servicio Labur",
                "subtitle": "Solo laborables",
                "columns": [
                    {
                        "label": "Lectivos",
                        "items": [
                            {"start": "06:55", "end": "07:05", "highlight": True},
                            {"start": "08:05", "end": "08:15"},
                            {"start": "11:55", "end": "12:05", "highlight": True},
                            {"start": "14:10", "end": "14:20", "highlight": True},
                            {"start": "17:40", "end": "17:50"},
                            {"start": "19:20", "end": "19:30", "highlight": True},
                        ],
                    },
                    {
                        "label": "No lectivos",
                        "items": [
                            {"start": "07:25", "end": "07:35", "highlight": True},
                            {"start": "08:35", "end": "08:45", "highlight": True},
                            {"start": "12:25", "end": "12:35"},
                            {"start": "14:40", "end": "14:50"},
                            {"start": "18:10", "end": "18:20", "highlight": True},
                            {"start": "—"},
                        ],
                    },
                ],
                "note": "En negrita se destacan las expediciones de recorrido corto (Labur).",
            },
        ],
    },
]


def seed_initial_data(session_factory) -> None:
    session: Session = session_factory()
    try:
        if session.query(models.ScheduleCard).count():
            return
        for idx, card in enumerate(DEFAULT_SCHEDULE_CARDS, start=1):
            session.add(
                models.ScheduleCard(
                    slug=card["slug"],
                    line_code=card["line_code"],
                    line_name=card["line_name"],
                    line_badge=card["line_badge"],
                    line_color=card["line_color"],
                    service_name=card["service_name"],
                    description=card["description"],
                    blocks=card["blocks"],
                    orden=idx,
                )
            )
        session.commit()
    finally:
        session.close()
