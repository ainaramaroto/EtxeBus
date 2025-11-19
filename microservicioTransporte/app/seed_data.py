"""Carga de datos iniciales para el microservicio de transporte."""

from sqlalchemy.orm import Session

from . import models

STOPS = [
    {"id": 101, "code": "ST01", "name": "Metro Etxebarri", "latitude": 43.24397, "longitude": -2.89677},
    {"id": 102, "code": "ST02", "name": "Metacal Kalea", "latitude": 43.24493, "longitude": -2.89371},
    {"id": 103, "code": "ST03", "name": "Doneztebe Eliza", "latitude": 43.24599, "longitude": -2.89112},
    {"id": 104, "code": "ST04", "name": "San Antonio Hiribidea", "latitude": 43.24703, "longitude": -2.88729},
    {"id": 105, "code": "ST05", "name": "Kukullaga Ikastetxea", "latitude": 43.24902, "longitude": -2.88615},
    {"id": 106, "code": "ST06", "name": "Kiroldegia", "latitude": 43.25067, "longitude": -2.88411},
    {"id": 107, "code": "ST07", "name": "Galicia Kalea", "latitude": 43.25266, "longitude": -2.88333},
    {"id": 108, "code": "ST08", "name": "Santa Marina", "latitude": 43.25589, "longitude": -2.88302},
    {"id": 109, "code": "ST09", "name": "IES Etxebarri BHI", "latitude": 43.25343, "longitude": -2.88489},
    {"id": 110, "code": "ST10", "name": "Goiko San Antonio", "latitude": 43.25103, "longitude": -2.88396},
    {"id": 111, "code": "ST11", "name": "Marivi Iturbe", "latitude": 43.24899, "longitude": -2.88603},
    {"id": 112, "code": "ST12", "name": "Beheko San Antonio", "latitude": 43.24718, "longitude": -2.88748},
]

LINES = [
    {
        "id": 1,
        "code": "L1",
        "name": "Circular Etxebarri",
        "description": "Recorrido completo por los barrios principales",
        "color": "#0055A4",
        "headway_minutes": 10,
    },
    {
        "id": 2,
        "code": "L2",
        "name": "Expreso Kukullaga",
        "description": "Servicio directo entre Metro y Kukullaga",
        "color": "#F4A300",
        "headway_minutes": 15,
    },
]

LINE_STOPS = [
    # Línea 1 circular
    (1, 101, 1, 0),
    (1, 102, 2, 3),
    (1, 103, 3, 5),
    (1, 104, 4, 7),
    (1, 105, 5, 9),
    (1, 106, 6, 12),
    (1, 107, 7, 15),
    (1, 108, 8, 18),
    (1, 109, 9, 13),
    (1, 110, 10, 11),
    (1, 111, 11, 10),
    (1, 112, 12, 8),
    # Línea 2 expreso
    (2, 101, 1, 0),
    (2, 105, 2, 5),
    (2, 108, 3, 9),
]


def seed_initial_data(session: Session) -> None:
    if session.query(models.Line).count() > 0:
        return

    session.bulk_save_objects([models.Stop(**stop) for stop in STOPS])
    session.bulk_save_objects([models.Line(**line) for line in LINES])
    session.flush()

    for line_id, stop_id, seq, minutes in LINE_STOPS:
        session.add(
            models.LineStop(
                line_id=line_id,
                stop_id=stop_id,
                sequence=seq,
                travel_minutes=minutes,
            )
        )
    session.commit()
