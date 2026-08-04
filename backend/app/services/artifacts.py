from __future__ import annotations

from hashlib import sha256
from pathlib import Path
import json
from typing import Any

import joblib

from app.core.config import PROJECT_ROOT, get_settings


class ArtifactError(RuntimeError):
    pass


def hash_file(path: Path) -> str:
    digest = sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


class ArtifactService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.artifact_dir = self.settings.model_manifest_path.parent
        self.manifest: dict[str, Any] = {}
        self.schema: dict[str, Any] = {}
        self.model = None
        self.error: str | None = None
        self._load()

    def _read_json(self, filename: str) -> dict[str, Any]:
        path = self.artifact_dir / filename
        if not path.exists():
            raise ArtifactError(f"Required artifact is missing: {filename}")
        return json.loads(path.read_text(encoding="utf-8"))

    def _load(self) -> None:
        try:
            self.manifest = self._read_json("artifact_manifest.json")
            self.schema = self._read_json("feature_schema.json")
            required = self.manifest.get("required_files", [])
            for filename in required:
                if not (self.artifact_dir / filename).exists():
                    raise ArtifactError(f"Required artifact is missing: {filename}")
            schema_hash = hash_file(self.artifact_dir / "feature_schema.json")
            if schema_hash != self.manifest.get("feature_schema_hash"):
                raise ArtifactError("Feature schema hash is invalid")
            if not self.manifest.get("approval_status"):
                raise ArtifactError("Model approval status is false")
            model_path = self.settings.model_path
            if not model_path.exists():
                raise ArtifactError("Approved model file is missing")
            if hash_file(model_path) != self.manifest.get("model_file_sha256"):
                raise ArtifactError("Approved model hash is invalid")
            self.model = joblib.load(model_path)
        except (ArtifactError, json.JSONDecodeError, OSError, ValueError) as exc:
            self.error = str(exc)
            self.model = None

    @property
    def ready(self) -> bool:
        return self.model is not None and self.error is None

    def public_info(self) -> dict[str, Any]:
        metadata = self._read_json("model_metadata.json")
        metrics = self._read_json("evaluation_metrics.json")
        return {
            "ready": self.ready,
            "error": self.error,
            "metadata": metadata,
            "metrics": metrics,
            "feature_schema": self.schema,
            "manifest": {
                "model_version": self.manifest.get("model_version"),
                "approval_status": self.manifest.get("approval_status"),
                "feature_schema_hash": self.manifest.get("feature_schema_hash"),
                "model_file_sha256": self.manifest.get("model_file_sha256"),
            },
        }

    def load_demo(self, kind: str) -> dict[str, Any]:
        if kind not in {"normal", "leak"}:
            raise ValueError("Unsupported demo kind")
        return self._read_json(f"demo_{kind}_sample.json")
