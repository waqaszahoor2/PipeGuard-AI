from dataclasses import dataclass
from typing import Mapping
import pandas as pd

from .config import EXPECTED_INTERVAL_MINUTES


@dataclass(frozen=True)
class FrameValidation:
    rows: int
    columns: int
    duplicate_timestamps: int
    missing_values: int
    timestamp_parse_failures: int
    interval_mismatches: int


def validate_timestamp_frame(frame: pd.DataFrame) -> FrameValidation:
    if "Timestamp" not in frame.columns:
        raise ValueError("Timestamp column is required")
    timestamps = pd.to_datetime(frame["Timestamp"], errors="coerce")
    diffs = timestamps.sort_values().diff().dropna().dt.total_seconds().div(60)
    mismatches = int((diffs != EXPECTED_INTERVAL_MINUTES).sum())
    return FrameValidation(
        rows=len(frame),
        columns=len(frame.columns),
        duplicate_timestamps=int(timestamps.duplicated().sum()),
        missing_values=int(frame.isna().sum().sum()),
        timestamp_parse_failures=int(timestamps.isna().sum()),
        interval_mismatches=mismatches,
    )


def validate_aligned_frames(frames: Mapping[str, pd.DataFrame]) -> None:
    if not frames:
        raise ValueError("At least one frame is required")
    reference_name, reference = next(iter(frames.items()))
    reference_ts = pd.to_datetime(reference["Timestamp"], errors="raise")
    for name, frame in frames.items():
        timestamps = pd.to_datetime(frame["Timestamp"], errors="raise")
        if len(timestamps) != len(reference_ts):
            raise ValueError(f"{name} row count does not match {reference_name}")
        if not timestamps.equals(reference_ts):
            raise ValueError(f"{name} timestamps do not match {reference_name}")


def require_finite_numeric(frame: pd.DataFrame, excluded: set[str] | None = None) -> None:
    excluded = excluded or set()
    numeric = frame[[c for c in frame.columns if c not in excluded]].apply(
        pd.to_numeric, errors="coerce"
    )
    if numeric.isna().any().any():
        bad = numeric.columns[numeric.isna().any()].tolist()
        raise ValueError(f"Non-numeric or missing values in columns: {bad}")
