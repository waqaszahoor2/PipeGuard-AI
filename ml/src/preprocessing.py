from dataclasses import dataclass
import pandas as pd
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


@dataclass(frozen=True)
class PreprocessingConfig:
    scale: bool = True
    imputation_strategy: str = "median"


def build_numeric_preprocessor(config: PreprocessingConfig | None = None) -> Pipeline:
    config = config or PreprocessingConfig()
    steps: list[tuple[str, object]] = [
        ("imputer", SimpleImputer(strategy=config.imputation_strategy)),
    ]
    if config.scale:
        steps.append(("scaler", StandardScaler()))
    return Pipeline(steps)


def sanitize_numeric_frame(frame: pd.DataFrame, columns: list[str]) -> pd.DataFrame:
    result = frame.loc[:, columns].copy()
    for column in columns:
        result[column] = pd.to_numeric(result[column], errors="coerce")
    return result
