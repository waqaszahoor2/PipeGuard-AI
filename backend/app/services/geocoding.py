from __future__ import annotations

import logging
import re
import time
from typing import Any

import httpx

from app.core.config import get_settings
from app.schemas import BoundingBox, GeocodeResult, GeocodeSearchResponse

logger = logging.getLogger(__name__)
settings = get_settings()

COORDINATE_PATTERN = re.compile(
    r"^\s*([+-]?\d+(?:\.\d+)?)\s*[\s,;]\s*([+-]?\d+(?:\.\d+)?)\s*$"
)

# In-memory geocoding cache: { normalized_query: (timestamp, response_data) }
_GEOCODE_CACHE: dict[str, tuple[float, GeocodeSearchResponse]] = {}
_LAST_NOMINATIM_REQUEST_TIME: float = 0.0


class GeocodingService:
    def __init__(self, base_url: str | None = None, cache_ttl: int | None = None) -> None:
        self.base_url = (base_url or settings.geocoder_base_url).rstrip("/")
        self.cache_ttl = cache_ttl or settings.geocoder_cache_seconds

    def parse_coordinate_query(self, query: str) -> GeocodeResult | None:
        match = COORDINATE_PATTERN.match(query)
        if not match:
            return None
        try:
            lat = float(match.group(1))
            lon = float(match.group(2))
            if not (-90.0 <= lat <= 90.0 and -180.0 <= lon <= 180.0):
                return None
            delta = 0.05
            south = max(-90.0, lat - delta)
            north = min(90.0, lat + delta)
            west = max(-180.0, lon - delta)
            east = min(180.0, lon + delta)
            return GeocodeResult(
                display_name=f"Coordinates ({lat:.4f}, {lon:.4f})",
                latitude=lat,
                longitude=lon,
                bounding_box=BoundingBox(south=south, west=west, north=north, east=east),
                type="coordinate",
            )
        except (ValueError, TypeError):
            return None

    def search(self, query: str) -> GeocodeSearchResponse:
        clean_query = query.strip()
        if not clean_query:
            return GeocodeSearchResponse(results=[], source="OpenStreetMap Nominatim", query="", cached=False)
        if len(clean_query) > 160:
            clean_query = clean_query[:160]

        # Check coordinate format
        coord_result = self.parse_coordinate_query(clean_query)
        if coord_result:
            return GeocodeSearchResponse(results=[coord_result], source="Coordinate Parsing", query=clean_query, cached=False)

        norm_key = clean_query.lower()
        now = time.time()

        # Cache check
        if norm_key in _GEOCODE_CACHE:
            cached_time, cached_resp = _GEOCODE_CACHE[norm_key]
            if now - cached_time < self.cache_ttl:
                return GeocodeSearchResponse(
                    results=cached_resp.results,
                    source=cached_resp.source,
                    query=clean_query,
                    cached=True,
                )

        # Upstream rate limit enforcement (max 1 req/sec)
        global _LAST_NOMINATIM_REQUEST_TIME
        elapsed = now - _LAST_NOMINATIM_REQUEST_TIME
        if elapsed < 1.0:
            time.sleep(1.0 - elapsed)
        _LAST_NOMINATIM_REQUEST_TIME = time.time()

        url = f"{self.base_url}/search"
        params = {
            "q": clean_query,
            "format": "jsonv2",
            "limit": 5,
            "addressdetails": 1,
        }
        headers = {
            "User-Agent": settings.geocoder_user_agent,
            "Accept": "application/json",
            "Accept-Language": "en",
        }

        try:
            with httpx.Client(timeout=float(settings.geocoder_timeout_seconds)) as client:
                resp = client.get(url, params=params, headers=headers)
                resp.raise_for_status()
                data = resp.json()
        except Exception as exc:
            logger.warning("Geocoding upstream call failed: %s", exc)
            return GeocodeSearchResponse(results=[], source="OpenStreetMap Nominatim", query=clean_query, cached=False)

        results: list[GeocodeResult] = []
        if isinstance(data, list):
            for item in data[:5]:
                if not isinstance(item, dict):
                    continue
                try:
                    lat = float(item["lat"])
                    lon = float(item["lon"])
                    if not (-90.0 <= lat <= 90.0 and -180.0 <= lon <= 180.0):
                        continue

                    bbox_raw = item.get("boundingbox", [])
                    if isinstance(bbox_raw, list) and len(bbox_raw) == 4:
                        south = float(bbox_raw[0])
                        north = float(bbox_raw[1])
                        west = float(bbox_raw[2])
                        east = float(bbox_raw[3])
                        # Swap if south/north inverted
                        if south > north:
                            south, north = north, south
                        if west > east:
                            west, east = east, west
                    else:
                        delta = 0.05
                        south, north = max(-90.0, lat - delta), min(90.0, lat + delta)
                        west, east = max(-180.0, lon - delta), min(180.0, lon + delta)

                    results.append(
                        GeocodeResult(
                            display_name=str(item.get("display_name", clean_query)),
                            latitude=lat,
                            longitude=lon,
                            bounding_box=BoundingBox(
                                south=south, west=west, north=north, east=east
                            ),
                            type=str(item.get("type", "location")),
                        )
                    )
                except (ValueError, TypeError, KeyError):
                    continue

        response_obj = GeocodeSearchResponse(
            results=results, source="OpenStreetMap Nominatim", query=clean_query, cached=False
        )
        _GEOCODE_CACHE[norm_key] = (now, response_obj)
        return response_obj
