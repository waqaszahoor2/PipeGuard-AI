from dataclasses import dataclass
import pandas as pd


@dataclass(frozen=True)
class TargetSummary:
    rows: int
    positive_rows: int
    positive_rate: float
    leak_event_columns: list[str]


def build_any_active_leak_target(
    leakage_frame: pd.DataFrame,
) -> tuple[pd.DataFrame, TargetSummary]:
    """Build the documented binary target from positive leakage-flow columns."""
    if "Timestamp" not in leakage_frame.columns:
        raise ValueError("Timestamp column is required")
    leakage_columns = [c for c in leakage_frame.columns if c != "Timestamp"]
    values = leakage_frame[leakage_columns].apply(pd.to_numeric, errors="coerce").fillna(0)
    target = values.gt(0).any(axis=1).astype("int8")
    active_ids = values.gt(0).apply(
        lambda row: ",".join(values.columns[row.to_numpy()].tolist()), axis=1
    )
    result = pd.DataFrame(
        {
            "Timestamp": pd.to_datetime(leakage_frame["Timestamp"], errors="raise"),
            "target": target,
            "active_leak_ids": active_ids,
            "total_leakage_m3h": values.sum(axis=1),
        }
    )
    summary = TargetSummary(
        rows=len(result),
        positive_rows=int(target.sum()),
        positive_rate=float(target.mean()),
        leak_event_columns=leakage_columns,
    )
    return result, summary
