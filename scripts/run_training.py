from pathlib import Path
import argparse
import json
import sys

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from ml.src.config import DataPaths, FEATURE_NAMES
from ml.src.data_loading import load_battledim_year
from ml.src.feature_engineering import build_aggregate_features
from ml.src.model_training import require_two_classes
from ml.src.target_construction import build_any_active_leak_target
from ml.src.temporal_splitting import chronological_split


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--dataset-dir",
        default="data/interim/pipeguard_dataset_pack",
    )
    parser.add_argument("--output-dir", default="model_artifacts")
    args = parser.parse_args()

    paths = DataPaths.from_dataset_root(args.dataset_dir)
    yearly = []
    for year in (2018, 2019):
        frames = load_battledim_year(paths, year)
        features = build_aggregate_features(frames)
        target, summary = build_any_active_leak_target(frames["leakages"])
        yearly.append(features.merge(target, on="Timestamp", validate="one_to_one"))
        print(f"{year}: positive rate {summary.positive_rate:.4f}")

    dataset = pd.concat(yearly, ignore_index=True).sort_values("Timestamp").reset_index(drop=True)
    split = chronological_split(dataset, gap_rows=12)
    output = Path(args.output_dir)
    output.mkdir(parents=True, exist_ok=True)

    status = {
        "approval_status": False,
        "feature_names": FEATURE_NAMES,
        "split_sizes": {
            "train": len(split.train),
            "validation": len(split.validation),
            "test": len(split.test),
        },
    }
    try:
        require_two_classes(dataset.loc[split.train, "target"].to_numpy(), "train")
        require_two_classes(dataset.loc[split.validation, "target"].to_numpy(), "validation")
        require_two_classes(dataset.loc[split.test, "target"].to_numpy(), "test")
    except ValueError as exc:
        status["reason"] = str(exc)
        (output / "training_status.json").write_text(
            json.dumps(status, indent=2), encoding="utf-8"
        )
        print(f"Approval blocked: {exc}")
        return

    raise SystemExit(
        "Two-class splits are available. Continue with candidate training, validation "
        "threshold selection and one-time final evaluation before setting approval true."
    )


if __name__ == "__main__":
    main()
