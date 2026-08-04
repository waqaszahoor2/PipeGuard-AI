from dataclasses import dataclass
import pandas as pd


@dataclass(frozen=True)
class TemporalSplit:
    train: pd.Index
    validation: pd.Index
    test: pd.Index


def chronological_split(
    frame: pd.DataFrame,
    train_fraction: float = 0.70,
    validation_fraction: float = 0.15,
    gap_rows: int = 0,
) -> TemporalSplit:
    if not 0 < train_fraction < 1:
        raise ValueError("train_fraction must be between 0 and 1")
    if not 0 < validation_fraction < 1:
        raise ValueError("validation_fraction must be between 0 and 1")
    if train_fraction + validation_fraction >= 1:
        raise ValueError("train and validation fractions must leave a test period")
    if "Timestamp" not in frame:
        raise ValueError("Timestamp column is required")
    timestamps = pd.to_datetime(frame["Timestamp"], errors="raise")
    if not timestamps.is_monotonic_increasing:
        raise ValueError("Frame must be sorted chronologically")

    n = len(frame)
    train_end = int(n * train_fraction)
    validation_end = int(n * (train_fraction + validation_fraction))
    train_stop = max(0, train_end - gap_rows)
    val_start = min(n, train_end + gap_rows)
    val_stop = max(val_start, validation_end - gap_rows)
    test_start = min(n, validation_end + gap_rows)

    return TemporalSplit(
        train=frame.index[:train_stop],
        validation=frame.index[val_start:val_stop],
        test=frame.index[test_start:],
    )


def prevent_event_overlap(
    target_frame: pd.DataFrame,
    split: TemporalSplit,
    event_column: str = "active_leak_ids",
) -> None:
    """Raise when a non-empty event identifier appears across split boundaries."""
    sets = []
    for index in (split.train, split.validation, split.test):
        values: set[str] = set()
        for cell in target_frame.loc[index, event_column].fillna(""):
            values.update(part for part in str(cell).split(",") if part)
        sets.append(values)
    if sets[0] & sets[1] or sets[0] & sets[2] or sets[1] & sets[2]:
        raise ValueError(
            "Active leak identifiers span chronological split boundaries. "
            "Increase the gap or use event-boundary splitting."
        )
