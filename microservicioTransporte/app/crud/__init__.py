"""Utility helpers shared by the routers."""
from __future__ import annotations

from typing import Any, Type, TypeVar

from sqlalchemy.orm import Session

ModelType = TypeVar("ModelType")


def get_all(db: Session, model: Type[ModelType]) -> list[ModelType]:
    return db.query(model).all()


def get_one(db: Session, model: Type[ModelType], obj_id: Any) -> ModelType | None:
    return db.get(model, obj_id)


def create(db: Session, model: Type[ModelType], data: dict[str, Any]) -> ModelType:
    instance = model(**data)
    db.add(instance)
    db.commit()
    db.refresh(instance)
    return instance


def update(db: Session, instance: ModelType, data: dict[str, Any]) -> ModelType:
    for key, value in data.items():
        setattr(instance, key, value)
    db.commit()
    db.refresh(instance)
    return instance


def delete(db: Session, instance: ModelType) -> None:
    db.delete(instance)
    db.commit()