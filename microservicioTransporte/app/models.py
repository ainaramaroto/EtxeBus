from sqlalchemy import Column, Integer, String, Float, ForeignKey, UniqueConstraint
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class Line(Base):
    __tablename__ = "transport_lines"

    id = Column(Integer, primary_key=True)
    code = Column(String(10), unique=True, nullable=False)
    name = Column(String(120), nullable=False)
    description = Column(String(255), nullable=True)
    color = Column(String(16), nullable=False, default="#0f5f97")
    headway_minutes = Column(Integer, nullable=False, default=12)

    stops = relationship(
        "LineStop",
        back_populates="line",
        cascade="all, delete-orphan",
        order_by="LineStop.sequence",
    )


class Stop(Base):
    __tablename__ = "transport_stops"

    id = Column(Integer, primary_key=True)
    code = Column(String(12), unique=True, nullable=False)
    name = Column(String(150), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    lines = relationship("LineStop", back_populates="stop", cascade="all, delete-orphan")


class LineStop(Base):
    __tablename__ = "transport_line_stops"
    __table_args__ = (
        UniqueConstraint("line_id", "stop_id", name="uq_line_stop"),
    )

    id = Column(Integer, primary_key=True)
    line_id = Column(Integer, ForeignKey("transport_lines.id", ondelete="CASCADE"), nullable=False)
    stop_id = Column(Integer, ForeignKey("transport_stops.id", ondelete="CASCADE"), nullable=False)
    sequence = Column(Integer, nullable=False)
    travel_minutes = Column(Integer, nullable=False)

    line = relationship("Line", back_populates="stops")
    stop = relationship("Stop", back_populates="lines")
