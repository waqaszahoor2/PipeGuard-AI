from collections.abc import Iterable
import numpy as np
import pandas as pd


def replay_predictions(
    estimator: object,
    features: pd.DataFrame,
    feature_names: list[str],
    threshold: float,
) -> Iterable[dict]:
    probabilities = estimator.predict_proba(features[feature_names])[:, 1]
    for timestamp, probability in zip(features["Timestamp"], probabilities, strict=True):
        yield {
            "timestamp": pd.Timestamp(timestamp).isoformat(),
            "leak_probability": float(probability),
            "status": "Possible Leak" if probability >= threshold else "Normal",
        }


def assert_prediction_consistency(
    notebook_probability: float,
    api_probability: float,
    tolerance: float = 1e-10,
) -> None:
    if not np.isclose(notebook_probability, api_probability, atol=tolerance, rtol=0):
        raise AssertionError("Notebook and API probabilities differ")
