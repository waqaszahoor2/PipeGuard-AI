import numpy as np
import pandas as pd

from .config import FEATURE_NAMES
from .validation import validate_aligned_frames


def build_aggregate_features(frames: dict[str, pd.DataFrame]) -> pd.DataFrame:
    """Create compact features using only current and past observations."""
    required = {"pressures", "flows", "levels", "demands"}
    missing = required.difference(frames)
    if missing:
        raise ValueError(f"Missing frames: {sorted(missing)}")
    selected = {name: frames[name] for name in required}
    validate_aligned_frames(selected)

    timestamps = pd.to_datetime(frames["pressures"]["Timestamp"], errors="raise")
    pressures = frames["pressures"].drop(columns="Timestamp").apply(pd.to_numeric, errors="coerce")
    flows = frames["flows"].drop(columns="Timestamp").apply(pd.to_numeric, errors="coerce")
    levels = frames["levels"].drop(columns="Timestamp").apply(pd.to_numeric, errors="coerce")
    demands = frames["demands"].drop(columns="Timestamp").apply(pd.to_numeric, errors="coerce")

    pressure_mean = pressures.mean(axis=1)
    flow_total = flows.sum(axis=1, min_count=1)
    tank_level = levels.iloc[:, 0]
    total_sensor_count = pressures.shape[1] + flows.shape[1] + levels.shape[1] + demands.shape[1]
    missing_count = (
        pressures.isna().sum(axis=1)
        + flows.isna().sum(axis=1)
        + levels.isna().sum(axis=1)
        + demands.isna().sum(axis=1)
    )

    result = pd.DataFrame(
        {
            "Timestamp": timestamps,
            "pressure_mean": pressure_mean,
            "pressure_std": pressures.std(axis=1, ddof=0),
            "pressure_min": pressures.min(axis=1),
            "pressure_change_15m": pressure_mean.diff(3),
            "flow_total": flow_total,
            "flow_change_15m": flow_total.diff(3),
            "flow_imbalance": flows.max(axis=1) - flows.min(axis=1),
            "tank_level": tank_level,
            "tank_level_change_15m": tank_level.diff(3),
            "demand_total": demands.sum(axis=1, min_count=1),
            "hour_sin": np.sin(2 * np.pi * timestamps.dt.hour / 24),
            "hour_cos": np.cos(2 * np.pi * timestamps.dt.hour / 24),
            "sensor_missing_count": missing_count,
            "sensor_availability_ratio": 1 - (missing_count / total_sensor_count),
        }
    )
    if list(result.columns[1:]) != FEATURE_NAMES:
        raise AssertionError("Feature order does not match the locked schema")
    return result
