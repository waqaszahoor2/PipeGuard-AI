from __future__ import annotations

import csv
import math
from io import BytesIO

import pandas as pd

from app.core.config import get_settings

SAFE_MIME_TYPES = {
    "text/csv",
    "application/csv",
    "text/plain",
    "application/vnd.ms-excel",
}


class CsvValidationError(ValueError):
    pass


def validate_csv_content(
    content: bytes,
    content_type: str | None,
    expected_columns: list[str],
) -> pd.DataFrame:
    settings = get_settings()
    if not content:
        raise CsvValidationError("CSV file is empty")
    if len(content) > settings.max_csv_bytes:
        raise CsvValidationError("CSV file exceeds the 4 MB limit")
    if content_type and content_type.split(";")[0].strip().lower() not in SAFE_MIME_TYPES:
        raise CsvValidationError("Unsupported CSV content type")
    if b"\x00" in content or content.startswith((b"MZ", b"\x7fELF", b"PK\x03\x04")):
        raise CsvValidationError("File content is not a plain CSV")

    sample = content[:4096].decode("utf-8-sig", errors="strict")
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=",;")
    except csv.Error as exc:
        raise CsvValidationError("Unable to identify a valid CSV delimiter") from exc

    try:
        frame = pd.read_csv(BytesIO(content), sep=dialect.delimiter)
    except Exception as exc:
        raise CsvValidationError("CSV content could not be parsed") from exc

    if frame.empty:
        raise CsvValidationError("CSV contains no data rows")
    if frame.shape[0] > 5000:
        raise CsvValidationError("CSV contains too many rows")
    if frame.shape[1] > 64:
        raise CsvValidationError("CSV contains too many columns")
    if frame.columns.duplicated().any():
        raise CsvValidationError("CSV contains duplicate columns")

    expected = ["Timestamp", *expected_columns]
    actual = frame.columns.tolist()
    if actual != expected:
        raise CsvValidationError("CSV columns or column order do not match the feature schema")

    parsed_ts = pd.to_datetime(frame["Timestamp"], errors="coerce", utc=True)
    if parsed_ts.isna().any():
        raise CsvValidationError("CSV contains invalid timestamps")
    if parsed_ts.duplicated().any():
        raise CsvValidationError("CSV contains duplicate timestamps")

    numeric = frame[expected_columns].apply(pd.to_numeric, errors="coerce")
    if numeric.isna().any().any():
        raise CsvValidationError("CSV contains missing or non-numeric feature values")
    values = numeric.to_numpy(dtype=float)
    if not bool(pd.DataFrame(values).map(math.isfinite).all().all()):
        raise CsvValidationError("CSV contains NaN or infinite values")

    for column in frame.select_dtypes(include="object").columns:
        if column == "Timestamp":
            continue
        unsafe = frame[column].astype(str).str.startswith(("=", "+", "-", "@"))
        if unsafe.any():
            raise CsvValidationError("CSV contains unsafe formula-like values")
    frame["Timestamp"] = parsed_ts
    frame[expected_columns] = numeric
    return frame
