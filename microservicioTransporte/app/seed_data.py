from __future__ import annotations

from decimal import Decimal

from sqlalchemy.orm import Session

from . import models


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
                        "label": "Lectivos (Metro -> Boquete)",
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
                "note": "Recorrido Luze: Metro -> Fuenlabrada -> Poligono -> Boquete -> Metro.",
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
                            {"start": "20:40", "end": "20:50", "highlight": True},
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


def seed_initial_data(session_factory) -> None:
    session: Session = session_factory()
    try:
        seed_lines_and_stops(session)
        seed_schedule_cards(session)
    finally:
        session.close()
