from dataclasses import dataclass
# pyrefly: ignore [missing-import]
import numpy as np
import pandas as pd
from sklearn.metrics import (
    average_precision_score,
    brier_score_loss,
    confusion_matrix,
    precision_score,
    recall_score,
)


@dataclass(frozen=True)
class EventMetrics:
    pr_auc: float | None
    point_precision: float
    point_recall: float
    false_alarms_per_day: float
    brier_score: float
    confusion_matrix: list[list[int]]


def calculate_point_metrics(
    y_true: np.ndarray,
    probabilities: np.ndarray,
    timestamps: pd.Series,
    threshold: float,
) -> EventMetrics:
    y_true = np.asarray(y_true, dtype=int)
    probabilities = np.asarray(probabilities, dtype=float)
    predictions = (probabilities >= threshold).astype(int)
    unique_classes = np.unique(y_true)
    pr_auc = (
        float(average_precision_score(y_true, probabilities))
        if len(unique_classes) > 1
        else None
    )
    span_days = max(
        (pd.to_datetime(timestamps).max() - pd.to_datetime(timestamps).min()).total_seconds()
        / 86400,
        1 / 288,
    )
    false_positives = int(((predictions == 1) & (y_true == 0)).sum())
    return EventMetrics(
        pr_auc=pr_auc,
        point_precision=float(precision_score(y_true, predictions, zero_division=0)),
        point_recall=float(recall_score(y_true, predictions, zero_division=0)),
        false_alarms_per_day=float(false_positives / span_days),
        brier_score=float(brier_score_loss(y_true, probabilities)),
        confusion_matrix=confusion_matrix(y_true, predictions, labels=[0, 1]).tolist(),
    )


def detection_delay_minutes(
    target: pd.Series,
    prediction: pd.Series,
    timestamps: pd.Series,
) -> list[float]:
    """Return detection delay for contiguous target-positive events."""
    target = target.astype(bool).reset_index(drop=True)
    prediction = prediction.astype(bool).reset_index(drop=True)
    timestamps = pd.to_datetime(timestamps).reset_index(drop=True)
    starts = target & ~target.shift(1, fill_value=False)
    delays: list[float] = []
    for start in starts[starts].index:
        end_candidates = target.index[(target.index > start) & (~target)]
        end = int(end_candidates.min()) if len(end_candidates) else len(target)
        hits = prediction.iloc[start:end]
        if hits.any():
            first_hit = int(hits[hits].index[0])
            delay = (timestamps.iloc[first_hit] - timestamps.iloc[start]).total_seconds() / 60
            delays.append(float(delay))
    return delays
