from __future__ import annotations

import io
import logging
import time
import unicodedata
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

import httpx
import pdfplumber
from sqlalchemy.orm import Session

from .. import models

LOGGER = logging.getLogger(__name__)

SCHEDULE_PDF_URL = (
    "https://www.etxebarri.eus/es-ES/Areas-Servicios/Transporte/EtxebarriBus/"
    "Etxebarribus-horarios.pdf"
)
PROJECT_ROOT = Path(__file__).resolve().parents[3]
LOCAL_PDF_PATH = PROJECT_ROOT / "horarios_etxebarri.pdf"
CACHE_TTL_SECONDS = 1800

CARD_LINE_HINTS = {
    "l1-santa-marina": 1,
    "l2-poligono-boquete": 4,
}

CARD_STOP_NAME_HINTS = {
    "l1-santa-marina": "L1 Metro Etxebarri",
    "l2-poligono-boquete": "L2 Metro Etxebarri",
}


class ExternalScheduleError(RuntimeError):
    """Raised when the horarios oficiales no se pueden obtener."""


def _normalize_time(value: str | None) -> str | None:
    if not value:
        return None
    value = value.strip().replace(" ", "")
    if ":" not in value:
        return None
    hours, minutes = value.split(":", 1)
    if not hours.isdigit() or not minutes.isdigit():
        return None
    hour_num = int(hours)
    minute_num = int(minutes)
    if minute_num >= 60:
        return None
    return f"{hour_num:02d}:{minute_num:02d}"


def _parse_cell(cell: str | None) -> list[str]:
    if not cell:
        return []

    raw = cell.strip()
    if not raw:
        return []

    if "111888" in raw and "555555" in raw:
        return ["18:55", "18:55"]

    cleaned = (
        raw.replace("\n", "")
        .replace(" ", "")
        .replace(":::", ":")
        .replace("::", ":")
        .replace("o", "0")
        .replace("O", "0")
    )

    results: list[str] = []
    cursor = 0
    while cursor < len(cleaned):
        candidate = cleaned[cursor : cursor + 5]
        normalized = _normalize_time(candidate)
        if normalized:
            results.append(normalized)
            cursor += 5
            continue
        cursor += 1

    return results


def _append_unique(bucket: list[str], value: str | None) -> None:
    if not value or value in bucket:
        return
    bucket.append(value)


def _strip_accents(value: str | None) -> str:
    if not value:
        return ""
    normalized = unicodedata.normalize("NFKD", value)
    return "".join(char for char in normalized if not unicodedata.combining(char)).lower()


def _infer_day_type(label: str | None, title: str | None = None) -> str | None:
    normalized_label = _strip_accents(label)
    normalized_title = _strip_accents(title)

    def contains(text: str, needle: str) -> bool:
        return needle in text if text else False

    if contains(normalized_label, "no lect"):
        return "NO_LECTIVO"
    if contains(normalized_label, "lect") and not contains(normalized_label, "no"):
        return "LECTIVO"
    if contains(normalized_label, "fest") or contains(normalized_label, "fin de semana"):
        return "FESTIVO"

    if contains(normalized_title, "no lect"):
        return "NO_LECTIVO"
    if contains(normalized_title, "lect") and not normalized_label:
        return "LECTIVO"
    if contains(normalized_title, "fest") or contains(normalized_title, "fin de semana"):
        return "FESTIVO"

    return None


def _parse_line_one(table: list[list[str | None]]) -> dict[str, list[str]]:
    if not table:
        raise ExternalScheduleError("No se encontro la tabla principal de la Linea 1")

    rows = table[3:]
    result = {"lectivos": [], "no_lectivos": [], "festivos": []}
    column_groups = {
        "lectivos": (0, 1, 2),
        "no_lectivos": (3, 4, 5),
        "festivos": (6, 7),
    }

    for row in rows:
        for key, indexes in column_groups.items():
            for idx in indexes:
                if idx >= len(row):
                    continue
                for raw in _parse_cell(row[idx]):
                    if raw == "06:01":
                        normalized = "06:10"
                    elif raw == "06:03":
                        normalized = "06:30"
                    else:
                        normalized = raw
                    _append_unique(result[key], normalized)

    if not result["lectivos"] or not result["no_lectivos"]:
        raise ExternalScheduleError("Datos incompletos en la tabla de la Linea 1")

    return result


def _parse_line_two(table: list[list[str | None]]) -> dict[str, list[str]]:
    if not table:
        raise ExternalScheduleError("No se encontro la tabla de la Linea 2")

    rows = table[4:]
    result = {"lectivos": [], "no_lectivos": []}
    for row in rows:
        left = row[0] if len(row) > 0 else None
        right = row[1] if len(row) > 1 else None
        for raw in _parse_cell(left):
            _append_unique(result["lectivos"], raw)
        for raw in _parse_cell(right):
            _append_unique(result["no_lectivos"], raw)

    if not result["lectivos"]:
        raise ExternalScheduleError("No se pudieron leer los horarios de la Linea 2")

    return result


def _times_to_items(times: Iterable[str]) -> list[dict[str, str]]:
    return [{"start": time_value} for time_value in times]


def _build_card_payloads(
    data: dict[str, dict[str, list[str]]]
) -> tuple[dict[str, list[dict]], dict[str, dict[str, list[str]]]]:
    line_one = data.get("line1") or {}
    line_two = data.get("line2") or {}

    cards: dict[str, list[dict]] = {}
    schedule_times: dict[str, dict[str, list[str]]] = {}

    if line_one:
        cards["l1-santa-marina"] = [
            {
                "title": "Laborables",
                "columns": [
                    {"label": "Lectivos", "items": _times_to_items(line_one.get("lectivos", []))},
                    {
                        "label": "No lectivos",
                        "items": _times_to_items(line_one.get("no_lectivos", [])),
                    },
                ],
                "note": "Extraido automaticamente del PDF oficial publicado por el Ayuntamiento de Etxebarri.",
            },
            {
                "title": "Fin de semana y festivos",
                "columns": [
                    {
                        "label": "Servicios publicados",
                        "items": _times_to_items(line_one.get("festivos", [])),
                    }
                ],
            },
        ]
        schedule_times["l1-santa-marina"] = {
            "LECTIVO": line_one.get("lectivos", []),
            "NO_LECTIVO": line_one.get("no_lectivos", []),
            "FESTIVO": line_one.get("festivos", []),
        }

    if line_two:
        cards["l2-poligono-boquete"] = [
            {
                "title": "Laborables",
                "columns": [
                    {"label": "Lectivos", "items": _times_to_items(line_two.get("lectivos", []))},
                    {
                        "label": "No lectivos",
                        "items": _times_to_items(line_two.get("no_lectivos", [])),
                    },
                ],
                "note": "Servicio oficial del PDF municipal (Metro > Poligono/Boquete).",
            }
        ]
        schedule_times["l2-poligono-boquete"] = {
            "LECTIVO": line_two.get("lectivos", []),
            "NO_LECTIVO": line_two.get("no_lectivos", []),
        }

    return cards, schedule_times


def _download_pdf(url: str = SCHEDULE_PDF_URL) -> bytes:
    try:
        with httpx.Client(timeout=20.0) as client:
            response = client.get(url)
            response.raise_for_status()
            return response.content
    except httpx.HTTPError as exc:
        LOGGER.warning("Fallo al descargar PDF remoto: %s", exc)
        if LOCAL_PDF_PATH.exists():
            LOGGER.info("Usando PDF local como respaldo: %s", LOCAL_PDF_PATH)
            return LOCAL_PDF_PATH.read_bytes()
        raise ExternalScheduleError(f"No se pudo descargar el PDF de horarios: {exc}") from exc


def _parse_pdf(content: bytes) -> dict[str, dict[str, list[str]]]:
    try:
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            page = pdf.pages[0]
            tables = page.extract_tables()
    except Exception as exc:
        raise ExternalScheduleError(f"No se pudo leer el PDF de horarios: {exc}") from exc

    line_one_table = next(
        (table for table in tables if table and table[0] and "METROTIK" in (table[0][0] or "")),
        None,
    )
    line_two_table = next(
        (table for table in tables if table and table[0] and "LINEA 2" in (table[0][0] or "")),
        None,
    )

    if not line_one_table or not line_two_table:
        raise ExternalScheduleError("Las tablas esperadas no estan presentes en el PDF")

    return {
        "line1": _parse_line_one(line_one_table),
        "line2": _parse_line_two(line_two_table),
    }


_CACHE: dict[str, tuple[float, dict[str, list[dict]], dict[str, dict[str, list[str]]]]] = {}


def _persist_snapshots(db: Session, blocks: dict[str, list[dict]]) -> None:
    if not blocks:
        return
    now = datetime.now(timezone.utc)
    existing = {
        snapshot.slug: snapshot
        for snapshot in db.query(models.ExternalScheduleSnapshot).all()
    }
    updated = False
    for slug, payload in blocks.items():
        snapshot = existing.get(slug)
        if not snapshot:
            snapshot = models.ExternalScheduleSnapshot(slug=slug)
            db.add(snapshot)
        snapshot.payload = payload
        snapshot.fetched_at = now
        updated = True
    if updated:
        db.commit()


def _load_snapshot_blocks(db: Session) -> dict[str, list[dict]]:
    stored = db.query(models.ExternalScheduleSnapshot).all()
    return {snapshot.slug: snapshot.payload for snapshot in stored if snapshot.payload}


def _resolve_card_metadata(db: Session) -> dict[str, dict[str, int | None]]:
    cards = {card.slug: card for card in db.query(models.ScheduleCard).all()}
    stop_names = {name for name in CARD_STOP_NAME_HINTS.values() if name}
    stops_by_name_and_line: dict[tuple[str, int | None], int] = {}
    if stop_names:
        stops = (
            db.query(models.Stop)
            .filter(models.Stop.nombre.in_(stop_names))
            .all()
        )
        for stop in stops:
            stops_by_name_and_line[(stop.nombre, stop.idLinea)] = stop.idParada

    metadata: dict[str, dict[str, int | None]] = {}
    for slug, card in cards.items():
        line_id = card.idLinea or CARD_LINE_HINTS.get(slug)
        stop_id = None
        stop_name = CARD_STOP_NAME_HINTS.get(slug)
        if stop_name:
            stop_id = stops_by_name_and_line.get((stop_name, line_id)) or stops_by_name_and_line.get(
                (stop_name, None)
            )
        metadata[slug] = {"idLinea": line_id, "idParada": stop_id}
    return metadata


def _build_schedule_payloads(
    schedule_times: dict[str, dict[str, list[str]]],
    metadata: dict[str, dict[str, int | None]],
) -> list[dict[str, int | list[str] | str | None]]:
    payloads: list[dict[str, int | list[str] | str | None]] = []
    for slug, day_map in schedule_times.items():
        info = metadata.get(slug, {})
        line_id = info.get("idLinea")
        stop_id = info.get("idParada")
        for day_type, hours in (day_map or {}).items():
            bucket: set[str] = set()
            for hour in hours or []:
                normalized = _normalize_time(hour)
                if normalized:
                    bucket.add(normalized)
            if not bucket:
                continue
            payloads.append(
                {
                    "slug": slug,
                    "tipoDia": day_type.upper(),
                    "horas": sorted(bucket),
                    "idLinea": line_id,
                    "idParada": stop_id,
                }
            )
    return payloads


def _derive_schedule_times_from_blocks(blocks: dict[str, list[dict]]) -> dict[str, dict[str, list[str]]]:
    derived: dict[str, dict[str, set[str]]] = {}
    for slug, card_blocks in blocks.items():
        slug_bucket = derived.setdefault(slug, {})
        for block in card_blocks or []:
            block_title = block.get("title") if isinstance(block, dict) else None
            columns = block.get("columns") if isinstance(block, dict) else None
            if not columns:
                continue
            for column in columns:
                if not isinstance(column, dict):
                    continue
                day_type = _infer_day_type(column.get("label"), block_title)
                if not day_type:
                    continue
                day_bucket = slug_bucket.setdefault(day_type, set())
                for item in column.get("items") or []:
                    if isinstance(item, dict):
                        candidate = item.get("start") or item.get("time") or item.get("label")
                    else:
                        candidate = str(item)
                    normalized = _normalize_time(candidate)
                    if normalized:
                        day_bucket.add(normalized)
    return {
        slug: {day_type: sorted(values) for day_type, values in day_map.items()}
        for slug, day_map in derived.items()
    }


def _sync_schedule_records(db: Session, schedule_times: dict[str, dict[str, list[str]]]) -> None:
    metadata = _resolve_card_metadata(db)
    payloads = _build_schedule_payloads(schedule_times, metadata)
    if not payloads:
        return
    target_keys = {
        (payload["idLinea"], payload["idParada"], payload["tipoDia"])
        for payload in payloads
    }
    payload_keys = set()
    existing: dict[tuple[int | None, int | None, str], models.Schedule] = {}
    for record in db.query(models.Schedule).all():
        key = (record.idLinea, record.idParada, record.tipoDia.upper())
        if key in target_keys:
            existing[key] = record

    for payload in payloads:
        key = (payload["idLinea"], payload["idParada"], payload["tipoDia"])
        payload_keys.add(key)
        record = existing.get(key)
        if record:
            record.horas = payload["horas"]
        else:
            db.add(
                models.Schedule(
                    idLinea=payload["idLinea"],
                    idParada=payload["idParada"],
                    tipoDia=payload["tipoDia"],
                    horas=payload["horas"],
                )
            )

    for key, record in existing.items():
        if key not in payload_keys:
            db.delete(record)

    db.commit()


def get_external_card_blocks(db: Session) -> dict[str, list[dict]]:
    """Devuelve las tarjetas generadas a partir del PDF externo, persistiendo snapshots y horarios."""

    cached = _CACHE.get("blocks")
    now = time.monotonic()
    if cached and now < cached[0]:
        _, cached_blocks, cached_times = cached
        _sync_schedule_records(db, cached_times)
        return cached_blocks

    try:
        content = _download_pdf()
        parsed = _parse_pdf(content)
        blocks, schedule_times = _build_card_payloads(parsed)
    except ExternalScheduleError:
        snapshots = _load_snapshot_blocks(db)
        if snapshots:
            LOGGER.info("Usando instantanea guardada de horarios oficiales")
            derived_times = _derive_schedule_times_from_blocks(snapshots)
            if derived_times:
                _sync_schedule_records(db, derived_times)
            else:
                LOGGER.warning("No se pudieron derivar horas desde las instantaneas guardadas")
            return snapshots
        raise

    _persist_snapshots(db, blocks)
    _sync_schedule_records(db, schedule_times)
    _CACHE["blocks"] = (now + CACHE_TTL_SECONDS, blocks, schedule_times)
    LOGGER.info("Horarios oficiales actualizados desde %s", SCHEDULE_PDF_URL)
    return blocks
