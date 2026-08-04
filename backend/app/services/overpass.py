from __future__ import annotations

from datetime import datetime, timezone
import logging
import time
from typing import Any

import httpx

from app.core.config import get_settings
from app.schemas import (
    BoundingBox,
    GlobalPipelineFeature,
    GlobalPipelineGeoJSON,
    GlobalPipelineGeometry,
    GlobalPipelineMetadata,
    GlobalPipelineProperties,
)

logger = logging.getLogger(__name__)
settings = get_settings()

SUBSTANCE_ALLOWLIST = {
    "water",
    "drinking_water",
    "sewage",
    "rainwater",
    "gas",
    "oil",
    "all",
}

# Cache for pipeline queries: { cache_key: (timestamp, GlobalPipelineGeoJSON) }
_PIPELINE_CACHE: dict[tuple, tuple[float, GlobalPipelineGeoJSON]] = {}


class OverpassPipelineService:
    def __init__(self, api_url: str | None = None, cache_ttl: int | None = None) -> None:
        self.api_url = api_url or settings.overpass_api_url
        self.cache_ttl = cache_ttl or settings.pipeline_cache_seconds

    def validate_bounding_box(
        self, south: float, west: float, north: float, east: float
    ) -> BoundingBox:
        if not (-90.0 <= south <= 90.0 and -90.0 <= north <= 90.0):
            raise ValueError("Latitude bounds must be between -90 and 90 degrees")
        if not (-180.0 <= west <= 180.0 and -180.0 <= east <= 180.0):
            raise ValueError("Longitude bounds must be between -180 and 180 degrees")
        if south >= north:
            raise ValueError("South boundary must be strictly less than North boundary")

        lat_span = abs(north - south)
        lon_span = abs(east - west) if west <= east else abs(180.0 - west) + abs(180.0 + east)

        max_lat_span = settings.global_pipeline_max_latitude_span
        max_lon_span = settings.global_pipeline_max_longitude_span

        if lat_span > max_lat_span or lon_span > max_lon_span:
            raise ValueError(
                f"Bounding box span ({lat_span:.2f}° × {lon_span:.2f}°) exceeds maximum allowed "
                f"visible area ({max_lat_span:.1f}° × {max_lon_span:.1f}°). Zoom in to load pipelines."
            )

        return BoundingBox(south=south, west=west, north=north, east=east)

    def build_query(
        self, bbox: BoundingBox, substance: str = "water"
    ) -> str:
        s, w, n, e = bbox.south, bbox.west, bbox.north, bbox.east
        if substance == "all":
            query_lines = [
                f'  way["man_made"="pipeline"]({s},{w},{n},{e});',
                f'  relation["man_made"="pipeline"]({s},{w},{n},{e});',
            ]
        elif substance in ("water", "drinking_water"):
            query_lines = [
                f'  way["man_made"="pipeline"]["substance"="water"]({s},{w},{n},{e});',
                f'  way["man_made"="pipeline"]["substance"="drinking_water"]({s},{w},{n},{e});',
                f'  relation["man_made"="pipeline"]["substance"="water"]({s},{w},{n},{e});',
                f'  relation["man_made"="pipeline"]["substance"="drinking_water"]({s},{w},{n},{e});',
            ]
        else:
            query_lines = [
                f'  way["man_made"="pipeline"]["substance"="{substance}"]({s},{w},{n},{e});',
                f'  relation["man_made"="pipeline"]["substance"="{substance}"]({s},{w},{n},{e});',
            ]

        body = "\n".join(query_lines)
        return f"[out:json][timeout:25];\n(\n{body}\n);\nout tags geom;"

    def fetch_pipelines(
        self,
        south: float,
        west: float,
        north: float,
        east: float,
        substance: str = "water",
        limit: int = 1000,
    ) -> GlobalPipelineGeoJSON:
        substance_clean = substance.lower().strip() if substance else "water"
        if substance_clean not in SUBSTANCE_ALLOWLIST:
            substance_clean = "water"

        bbox = self.validate_bounding_box(south, west, north, east)
        limit = max(10, min(limit, settings.global_pipeline_max_results))

        cache_key = (
            round(bbox.south, 3),
            round(bbox.west, 3),
            round(bbox.north, 3),
            round(bbox.east, 3),
            substance_clean,
            limit,
        )
        now = time.time()
        if cache_key in _PIPELINE_CACHE:
            cached_time, cached_geojson = _PIPELINE_CACHE[cache_key]
            if now - cached_time < self.cache_ttl:
                return cached_geojson

        query_str = self.build_query(bbox, substance_clean)
        headers = {
            "User-Agent": "PipeGuard-AI/1.0 (water-pipeline-research-prototype; contact@pipeguard.local)",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        }

        features: list[GlobalPipelineFeature] = []
        try:
            with httpx.Client(timeout=30.0) as client:
                resp = client.post(self.api_url, data={"data": query_str}, headers=headers)
                resp.raise_for_status()
                data = resp.json()
        except Exception as exc:
            logger.warning("Overpass API request failed: %s", exc)
            return GlobalPipelineGeoJSON(
                features=[],
                metadata=GlobalPipelineMetadata(
                    result_count=0,
                    query_timestamp=datetime.now(timezone.utc),
                    bounding_box=bbox,
                ),
            )

        elements = data.get("elements", []) if isinstance(data, dict) else []
        for elem in elements[:limit]:
            if not isinstance(elem, dict):
                continue
            geom_raw = elem.get("geometry", [])
            if not isinstance(geom_raw, list) or len(geom_raw) < 2:
                continue

            coords = [[pt["lon"], pt["lat"]] for pt in geom_raw if isinstance(pt, dict) and "lon" in pt and "lat" in pt]
            if len(coords) < 2:
                continue

            tags = elem.get("tags", {}) if isinstance(elem.get("tags"), dict) else {}
            osm_type = str(elem.get("type", "way"))
            osm_id = elem.get("id", 0)

            props = GlobalPipelineProperties(
                pipeline_id=f"osm-{osm_type}-{osm_id}",
                name=str(tags.get("name", "Not available")),
                operator=str(tags.get("operator", "Not available")),
                substance=str(tags.get("substance", substance_clean if substance_clean != "all" else "pipeline")),
                location=str(tags.get("location", "underground")),
                usage=str(tags.get("usage", "distribution")),
                diameter=str(tags.get("diameter", "Not available")),
                pressure=str(tags.get("pressure", "Not available")),
                capacity=str(tags.get("capacity", "Not available")),
                source="OpenStreetMap",
                osm_type=osm_type,
                osm_id=osm_id,
            )

            geometry = GlobalPipelineGeometry(type="LineString", coordinates=coords)
            features.append(GlobalPipelineFeature(geometry=geometry, properties=props))

        result_geojson = GlobalPipelineGeoJSON(
            features=features,
            metadata=GlobalPipelineMetadata(
                result_count=len(features),
                query_timestamp=datetime.now(timezone.utc),
                bounding_box=bbox,
            ),
        )
        _PIPELINE_CACHE[cache_key] = (now, result_geojson)
        return result_geojson
