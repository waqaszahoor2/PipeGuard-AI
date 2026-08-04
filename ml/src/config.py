from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class DataPaths:
    root: Path
    battledim: Path
    calgary: Path

    @classmethod
    def from_dataset_root(cls, dataset_root: str | Path) -> "DataPaths":
        root = Path(dataset_root).resolve()
        return cls(
            root=root,
            battledim=root / "raw" / "battledim",
            calgary=root / "raw" / "calgary",
        )


FEATURE_NAMES = [
    "pressure_mean",
    "pressure_std",
    "pressure_min",
    "pressure_change_15m",
    "flow_total",
    "flow_change_15m",
    "flow_imbalance",
    "tank_level",
    "tank_level_change_15m",
    "demand_total",
    "hour_sin",
    "hour_cos",
    "sensor_missing_count",
    "sensor_availability_ratio",
]

EXPECTED_INTERVAL_MINUTES = 5
RANDOM_STATE = 42
