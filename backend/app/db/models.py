from __future__ import annotations

from datetime import UTC, date, datetime
from typing import Any

from sqlalchemy import JSON, Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


def utcnow() -> datetime:
    return datetime.now(UTC)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(512))
    role: Mapped[str] = mapped_column(String(32), default="technician")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class PipeAsset(Base):
    __tablename__ = "pipe_assets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    external_id: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    pressure_zone: Mapped[str | None] = mapped_column(String(128))
    status: Mapped[str | None] = mapped_column(String(64))
    length_m: Mapped[float | None] = mapped_column(Float)
    diameter_mm: Mapped[float | None] = mapped_column(Float)
    material: Mapped[str | None] = mapped_column(String(64))
    installation_year: Mapped[int | None] = mapped_column(Integer)
    geometry_json: Mapped[dict[str, Any] | None] = mapped_column(JSON)
    source: Mapped[str] = mapped_column(String(128), default="Calgary research data")


class HistoricalBreak(Base):
    __tablename__ = "historical_breaks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    pipe_asset_id: Mapped[int | None] = mapped_column(ForeignKey("pipe_assets.id"))
    break_date: Mapped[date | None] = mapped_column(Date)
    break_type: Mapped[str | None] = mapped_column(String(16))
    status: Mapped[str | None] = mapped_column(String(32))
    geometry_json: Mapped[dict[str, Any] | None] = mapped_column(JSON)
    match_distance_m: Mapped[float | None] = mapped_column(Float)


class InspectionRecord(Base):
    __tablename__ = "inspection_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    pipeline_id: Mapped[str] = mapped_column(String(128), index=True)
    technician: Mapped[str] = mapped_column(String(320))
    inspection_date: Mapped[date] = mapped_column(Date, default=date.today)
    inspection_type: Mapped[str] = mapped_column(String(64))
    camera_result: Mapped[str | None] = mapped_column(Text)
    acoustic_result: Mapped[str | None] = mapped_column(Text)
    ultrasonic_result: Mapped[str | None] = mapped_column(Text)
    visible_damage: Mapped[str | None] = mapped_column(Text)
    confirmed_leak: Mapped[str] = mapped_column(String(32), default="not_determined")
    repair_required: Mapped[bool] = mapped_column(Boolean, default=False)
    repair_status: Mapped[str] = mapped_column(String(64), default="not_reviewed")
    notes: Mapped[str | None] = mapped_column(Text)
    follow_up_date: Mapped[date | None] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    attachments: Mapped[list[InspectionAttachment]] = relationship(
        back_populates="inspection", cascade="all, delete-orphan"
    )


class InspectionAttachment(Base):
    __tablename__ = "inspection_attachments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    inspection_id: Mapped[int] = mapped_column(ForeignKey("inspection_records.id"))
    safe_filename: Mapped[str] = mapped_column(String(255))
    content_type: Mapped[str] = mapped_column(String(128))
    byte_size: Mapped[int] = mapped_column(Integer)
    storage_key: Mapped[str] = mapped_column(String(512))
    sha256: Mapped[str] = mapped_column(String(64))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    inspection: Mapped[InspectionRecord] = relationship(back_populates="attachments")


class PredictionAudit(Base):
    __tablename__ = "prediction_audit"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    request_id: Mapped[str] = mapped_column(String(64), index=True)
    data_mode: Mapped[str] = mapped_column(String(32))
    model_version: Mapped[str] = mapped_column(String(64))
    status: Mapped[str] = mapped_column(String(64))
    probability: Mapped[float | None] = mapped_column(Float)
    schema_hash: Mapped[str | None] = mapped_column(String(64))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class ModelRegistry(Base):
    __tablename__ = "model_registry"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    model_version: Mapped[str] = mapped_column(String(64), unique=True)
    artifact_hash: Mapped[str | None] = mapped_column(String(64))
    schema_hash: Mapped[str] = mapped_column(String(64))
    approval_status: Mapped[bool] = mapped_column(Boolean, default=False)
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class ApplicationEvent(Base):
    __tablename__ = "application_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    event_type: Mapped[str] = mapped_column(String(64), index=True)
    actor_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    request_id: Mapped[str | None] = mapped_column(String(64))
    summary: Mapped[str] = mapped_column(String(512))
    metadata_json: Mapped[dict[str, Any] | None] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
