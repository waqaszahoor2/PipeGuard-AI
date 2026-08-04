from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


WARNING = (
    "This is an AI-generated early warning, not a confirmed leak. "
    "Technician verification is required."
)


class ErrorBody(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    error: ErrorBody
    request_id: str | None = None


class AbnormalSensor(BaseModel):
    sensor_id: str
    sensor_type: Literal["pressure", "flow", "tank_level", "demand"]
    status: Literal["low", "high", "missing", "unstable"]
    deviation: float


class PredictionResponse(BaseModel):
    status: Literal["Normal", "Possible Leak"]
    leak_probability: float = Field(ge=0, le=1)
    severity: Literal["Low", "Medium", "High", "Critical"]
    suspected_zone: str | None
    abnormal_sensors: list[AbnormalSensor]
    main_reason: str
    recommended_action: str
    warning: str = WARNING
    data_mode: Literal["demo", "research", "live"]
    data_timestamp: datetime
    prediction_timestamp: datetime
    model_version: str
    schema_version: str


class ManualPredictionRequest(BaseModel):
    timestamp: datetime
    pressure_mean: float
    pressure_std: float
    pressure_min: float
    pressure_change_15m: float
    flow_total: float
    flow_change_15m: float
    flow_imbalance: float
    tank_level: float
    tank_level_change_15m: float
    demand_total: float
    hour_sin: float
    hour_cos: float
    sensor_missing_count: float
    sensor_availability_ratio: float

    @field_validator("*", mode="after")
    @classmethod
    def finite_numbers(cls, value):
        if isinstance(value, float) and (value != value or value in (float("inf"), float("-inf"))):
            raise ValueError("All numeric values must be finite")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=256)


class UserResponse(BaseModel):
    id: int
    email: str
    role: str


InspectionType = Literal[
    "camera",
    "acoustic",
    "ultrasonic",
    "electromagnetic",
    "general_visual",
]
RepairStatus = Literal[
    "not_reviewed",
    "inspection_required",
    "repair_scheduled",
    "repair_in_progress",
    "repaired",
    "monitoring",
    "closed",
]
ConfirmedLeak = Literal["yes", "no", "not_determined"]


class InspectionCreate(BaseModel):
    pipeline_id: str = Field(min_length=1, max_length=128)
    technician: str = Field(min_length=1, max_length=320)
    inspection_date: date
    inspection_type: InspectionType
    camera_result: str | None = Field(default=None, max_length=4000)
    acoustic_result: str | None = Field(default=None, max_length=4000)
    ultrasonic_result: str | None = Field(default=None, max_length=4000)
    visible_damage: str | None = Field(default=None, max_length=4000)
    confirmed_leak: ConfirmedLeak = "not_determined"
    repair_required: bool = False
    repair_status: RepairStatus = "not_reviewed"
    notes: str | None = Field(default=None, max_length=8000)
    follow_up_date: date | None = None


class InspectionUpdate(BaseModel):
    inspection_date: date | None = None
    inspection_type: InspectionType | None = None
    camera_result: str | None = Field(default=None, max_length=4000)
    acoustic_result: str | None = Field(default=None, max_length=4000)
    ultrasonic_result: str | None = Field(default=None, max_length=4000)
    visible_damage: str | None = Field(default=None, max_length=4000)
    confirmed_leak: ConfirmedLeak | None = None
    repair_required: bool | None = None
    repair_status: RepairStatus | None = None
    notes: str | None = Field(default=None, max_length=8000)
    follow_up_date: date | None = None


class InspectionResponse(InspectionCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class ReplayRequest(BaseModel):
    samples: list[ManualPredictionRequest] = Field(min_length=1, max_length=500)
