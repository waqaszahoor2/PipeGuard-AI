from pathlib import Path
import pandas as pd

from .config import DataPaths


def read_battledim_csv(path: str | Path) -> pd.DataFrame:
    """Load a BattLeDIM CSV using the documented delimiter and decimal format."""
    return pd.read_csv(
        path,
        sep=";",
        decimal=",",
        parse_dates=["Timestamp"],
        low_memory=False,
    )


def load_battledim_year(paths: DataPaths, year: int) -> dict[str, pd.DataFrame]:
    base = paths.battledim
    files = {
        "pressures": base / f"{year}_SCADA_Pressures.csv",
        "flows": base / f"{year}_SCADA_Flows.csv",
        "levels": base / f"{year}_SCADA_Levels.csv",
        "demands": base / f"{year}_SCADA_Demands.csv",
        "leakages": base / f"{year}_Leakages.csv",
    }
    missing = [str(path) for path in files.values() if not path.exists()]
    if missing:
        raise FileNotFoundError(f"Missing BattLeDIM files: {missing}")
    return {name: read_battledim_csv(path) for name, path in files.items()}


def load_calgary_assets(paths: DataPaths) -> dict[str, pd.DataFrame]:
    base = paths.calgary
    files = {
        "pipes": base / "public_water_main.csv",
        "breaks": base / "water_main_breaks.csv",
        "communities": base / "community_district_boundaries.csv",
    }
    missing = [str(path) for path in files.values() if not path.exists()]
    if missing:
        raise FileNotFoundError(f"Missing Calgary files: {missing}")
    return {name: pd.read_csv(path, low_memory=False) for name, path in files.items()}
