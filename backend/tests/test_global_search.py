from __future__ import annotations

import pytest
from unittest.mock import MagicMock, patch

from app.services.geocoding import GeocodingService
from app.services.overpass import OverpassPipelineService


def test_coordinate_parsing() -> None:
    service = GeocodingService()
    result = service.parse_coordinate_query("24.8607, 67.0011")
    assert result is not None
    assert pytest.approx(result.latitude, abs=1e-3) == 24.8607
    assert pytest.approx(result.longitude, abs=1e-3) == 67.0011
    assert result.type == "coordinate"

    invalid_lat = service.parse_coordinate_query("999.0, 67.0011")
    assert invalid_lat is None

    non_coord = service.parse_coordinate_query("Karachi, Pakistan")
    assert non_coord is None


def test_geocode_search_mocked() -> None:
    service = GeocodingService(cache_ttl=3600)
    mock_payload = [
        {
            "display_name": "Karachi, Sindh, Pakistan",
            "lat": "24.8607",
            "lon": "67.0011",
            "boundingbox": ["24.7", "25.1", "66.8", "67.3"],
            "type": "city",
        }
    ]

    with patch("httpx.Client") as mock_client_cls:
        mock_client = MagicMock()
        mock_resp = MagicMock()
        mock_resp.json.return_value = mock_payload
        mock_resp.raise_for_status.return_value = None
        mock_client.get.return_value = mock_resp
        mock_client_cls.return_value.__enter__.return_value = mock_client

        res = service.search("Karachi")
        assert len(res.results) == 1
        assert res.results[0].display_name == "Karachi, Sindh, Pakistan"
        assert pytest.approx(res.results[0].latitude, abs=1e-3) == 24.8607
        assert res.results[0].bounding_box.south == 24.7


def test_bounding_box_validation() -> None:
    service = OverpassPipelineService()
    # Valid bounding box
    bbox = service.validate_bounding_box(south=24.80, west=66.90, north=24.95, east=67.15)
    assert bbox.south == 24.80
    assert bbox.north == 24.95

    # Invalid latitude bounds (south >= north)
    with pytest.raises(ValueError, match="South boundary must be strictly less"):
        service.validate_bounding_box(south=25.0, west=66.9, north=24.0, east=67.1)

    # Excessive geographic span (> 2 degrees)
    with pytest.raises(ValueError, match="exceeds maximum allowed"):
        service.validate_bounding_box(south=10.0, west=10.0, north=15.0, east=15.0)


def test_overpass_query_building() -> None:
    service = OverpassPipelineService()
    bbox = service.validate_bounding_box(south=24.80, west=66.90, north=24.95, east=67.15)

    q_water = service.build_query(bbox, substance="water")
    assert 'way["man_made"="pipeline"]["substance"="water"]' in q_water
    assert "24.8" in q_water

    q_all = service.build_query(bbox, substance="all")
    assert 'way["man_made"="pipeline"](24.8,66.9,24.95,67.15);' in q_all


def test_overpass_geojson_normalization() -> None:
    service = OverpassPipelineService()
    mock_overpass_resp = {
        "elements": [
            {
                "type": "way",
                "id": 998877,
                "tags": {
                    "man_made": "pipeline",
                    "substance": "water",
                    "name": "Karachi Main Trunk Pipe",
                    "operator": "KWSC",
                },
                "geometry": [
                    {"lat": 24.86, "lon": 67.00},
                    {"lat": 24.87, "lon": 67.01},
                ],
            }
        ]
    }

    with patch("httpx.Client") as mock_client_cls:
        mock_client = MagicMock()
        mock_resp = MagicMock()
        mock_resp.json.return_value = mock_overpass_resp
        mock_resp.raise_for_status.return_value = None
        mock_client.post.return_value = mock_resp
        mock_client_cls.return_value.__enter__.return_value = mock_client

        geojson = service.fetch_pipelines(
            south=24.80, west=66.90, north=24.95, east=67.15, substance="water"
        )
        assert geojson.type == "FeatureCollection"
        assert len(geojson.features) == 1
        feat = geojson.features[0]
        assert feat.properties.pipeline_id == "osm-way-998877"
        assert feat.properties.name == "Karachi Main Trunk Pipe"
        assert feat.properties.operator == "KWSC"
        assert feat.geometry.type == "LineString"
        assert feat.geometry.coordinates == [[67.00, 24.86], [67.01, 24.87]]
