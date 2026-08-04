import numpy as np
import pandas as pd
import pytest

from ml.src.event_metrics import calculate_point_metrics
from ml.src.localization import localize_zone
from ml.src.temporal_splitting import chronological_split
from ml.src.target_construction import build_any_active_leak_target


def test_target_uses_positive_leakage_values() -> None:
    frame = pd.DataFrame(
        {
            "Timestamp": pd.date_range("2020-01-01", periods=3, freq="5min"),
            "p1": [0, 0.1, 0],
            "p2": [0, 0, 2],
        }
    )
    target, summary = build_any_active_leak_target(frame)
    assert target["target"].tolist() == [0, 1, 1]
    assert summary.positive_rows == 2


def test_chronological_split_preserves_order() -> None:
    frame = pd.DataFrame(
        {"Timestamp": pd.date_range("2020-01-01", periods=100, freq="5min")}
    )
    split = chronological_split(frame)
    assert max(split.train) < min(split.validation)
    assert max(split.validation) < min(split.test)


def test_unsorted_split_rejected() -> None:
    frame = pd.DataFrame(
        {"Timestamp": pd.to_datetime(["2020-01-02", "2020-01-01"])}
    )
    with pytest.raises(ValueError):
        chronological_split(frame)


def test_metrics_handle_two_classes() -> None:
    y = np.array([0, 0, 1, 1])
    p = np.array([0.1, 0.8, 0.7, 0.9])
    ts = pd.Series(pd.date_range("2020-01-01", periods=4, freq="5min"))
    result = calculate_point_metrics(y, p, ts, 0.5)
    assert result.pr_auc is not None
    assert result.confusion_matrix == [[1, 1], [0, 2]]


def test_zone_localization() -> None:
    assert localize_zone(["p2", "p3"], {"A": ["p1"], "B": ["p2", "p3"]}) == "B"
