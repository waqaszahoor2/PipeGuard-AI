from pathlib import Path
import argparse
import json
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from ml.src.config import DataPaths
from ml.src.data_loading import load_battledim_year, load_calgary_assets
from ml.src.target_construction import build_any_active_leak_target
from ml.src.validation import validate_timestamp_frame


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--dataset-dir",
        default="data/interim/pipeguard_dataset_pack",
    )
    parser.add_argument("--output", default="reports/dataset_audit_runtime.json")
    args = parser.parse_args()
    paths = DataPaths.from_dataset_root(args.dataset_dir)
    report: dict = {"battledim": {}, "calgary": {}}
    for year in (2018, 2019):
        frames = load_battledim_year(paths, year)
        report["battledim"][str(year)] = {
            name: validate_timestamp_frame(frame).__dict__
            for name, frame in frames.items()
        }
        _, target_summary = build_any_active_leak_target(frames["leakages"])
        report["battledim"][str(year)]["target"] = target_summary.__dict__
    calgary = load_calgary_assets(paths)
    report["calgary"] = {
        name: {"rows": len(frame), "columns": frame.columns.tolist()}
        for name, frame in calgary.items()
    }
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"Wrote {output}")


if __name__ == "__main__":
    main()
