from __future__ import annotations

from datetime import datetime, timezone
from hashlib import sha256
from pathlib import Path
import json
import platform

import joblib
import sklearn


def sha256_file(path: str | Path) -> str:
    digest = sha256()
    with Path(path).open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def export_approved_artifact(
    estimator: object,
    output_dir: str | Path,
    feature_schema_path: str | Path,
    metadata: dict,
) -> dict:
    output = Path(output_dir)
    output.mkdir(parents=True, exist_ok=True)
    model_path = output / "approved_model.joblib"
    joblib.dump(estimator, model_path)
    schema_hash = sha256_file(feature_schema_path)
    manifest = {
        "model_version": metadata["model_version"],
        "training_date": datetime.now(timezone.utc).isoformat(),
        "dataset_version": metadata["dataset_version"],
        "git_commit": metadata.get("git_commit", "unknown"),
        "feature_schema_hash": schema_hash,
        "model_file_sha256": sha256_file(model_path),
        "python_version": platform.python_version(),
        "scikit_learn_version": sklearn.__version__,
        "validation_metrics": metadata["validation_metrics"],
        "test_metrics": metadata["test_metrics"],
        "approval_status": True,
    }
    (output / "artifact_manifest.json").write_text(
        json.dumps(manifest, indent=2), encoding="utf-8"
    )
    return manifest
