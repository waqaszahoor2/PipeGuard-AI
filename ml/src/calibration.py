import numpy as np
from sklearn.calibration import calibration_curve


def calibration_summary(y_true: np.ndarray, probabilities: np.ndarray, bins: int = 10) -> dict:
    if len(np.unique(y_true)) < 2:
        return {"status": "not_available", "reason": "Target contains one class."}
    fraction_positive, mean_predicted = calibration_curve(
        y_true, probabilities, n_bins=bins, strategy="quantile"
    )
    return {
        "status": "calculated",
        "fraction_positive": fraction_positive.tolist(),
        "mean_predicted_probability": mean_predicted.tolist(),
    }
