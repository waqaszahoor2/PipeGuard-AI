from dataclasses import dataclass
import numpy as np
from sklearn.base import ClassifierMixin
from sklearn.dummy import DummyClassifier
from sklearn.ensemble import ExtraTreesClassifier, HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

from .preprocessing import PreprocessingConfig, build_numeric_preprocessor
from .config import RANDOM_STATE


@dataclass(frozen=True)
class Candidate:
    name: str
    estimator: ClassifierMixin


def build_candidates() -> list[Candidate]:
    return [
        Candidate("dummy", DummyClassifier(strategy="prior")),
        Candidate(
            "logistic_regression",
            Pipeline(
                [
                    ("preprocess", build_numeric_preprocessor(PreprocessingConfig(scale=True))),
                    (
                        "model",
                        LogisticRegression(
                            class_weight="balanced",
                            max_iter=1000,
                            random_state=RANDOM_STATE,
                        ),
                    ),
                ]
            ),
        ),
        Candidate(
            "random_forest",
            Pipeline(
                [
                    ("preprocess", build_numeric_preprocessor(PreprocessingConfig(scale=False))),
                    (
                        "model",
                        RandomForestClassifier(
                            n_estimators=250,
                            class_weight="balanced_subsample",
                            min_samples_leaf=5,
                            n_jobs=-1,
                            random_state=RANDOM_STATE,
                        ),
                    ),
                ]
            ),
        ),
        Candidate(
            "hist_gradient_boosting",
            Pipeline(
                [
                    ("preprocess", build_numeric_preprocessor(PreprocessingConfig(scale=False))),
                    (
                        "model",
                        HistGradientBoostingClassifier(
                            learning_rate=0.06,
                            max_iter=250,
                            random_state=RANDOM_STATE,
                        ),
                    ),
                ]
            ),
        ),
        Candidate(
            "extra_trees",
            Pipeline(
                [
                    ("preprocess", build_numeric_preprocessor(PreprocessingConfig(scale=False))),
                    (
                        "model",
                        ExtraTreesClassifier(
                            n_estimators=250,
                            class_weight="balanced",
                            min_samples_leaf=4,
                            n_jobs=-1,
                            random_state=RANDOM_STATE,
                        ),
                    ),
                ]
            ),
        ),
    ]


def require_two_classes(y: np.ndarray, split_name: str) -> None:
    classes = np.unique(np.asarray(y))
    if len(classes) < 2:
        raise ValueError(
            f"{split_name} contains only class {classes.tolist()}; "
            "classification approval is blocked."
        )
