from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class Stop(BaseModel):
    id: int
    code: str
    name: str
    latitude: float
    longitude: float

    class Config:
        from_attributes = True


class LineStop(BaseModel):
    stop_id: int
    sequence: int
    travel_minutes: int = Field(..., description="Minutos desde el inicio de la línea")
    stop: Stop

    class Config:
        from_attributes = True


class Line(BaseModel):
    id: int
    code: str
    name: str
    description: Optional[str]
    color: str
    headway_minutes: int
    stops: Optional[List[LineStop]] = None

    class Config:
        from_attributes = True


class ArrivalEstimate(BaseModel):
    line_id: int
    line_code: str
    stop_id: int
    upcoming_times: List[datetime]


class JourneyStep(BaseModel):
    line_id: int
    line_code: str
    from_stop: Stop
    to_stop: Stop
    travel_minutes: int
    direction: str


class JourneyPlan(BaseModel):
    origin: Stop
    destination: Stop
    total_minutes: int
    steps: List[JourneyStep]
