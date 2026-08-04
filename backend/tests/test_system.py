def test_health(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["application"] == "PipeGuard AI"


def test_readiness_is_honest(client):
    response = client.get("/api/v1/readiness")
    assert response.status_code == 200
    payload = response.json()
    assert payload["api_ready"] is True
    assert payload["model_ready"] is False


def test_demo_leak_has_warning(client):
    response = client.post("/api/v1/predict/demo/leak")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "Possible Leak"
    assert "Technician verification is required" in payload["warning"]


def test_real_prediction_returns_controlled_model_error(client):
    response = client.post(
        "/api/v1/predict/manual",
        json={
            "timestamp": "2019-01-01T00:00:00Z",
            "pressure_mean": 50,
            "pressure_std": 5,
            "pressure_min": 30,
            "pressure_change_15m": -1,
            "flow_total": 200,
            "flow_change_15m": 10,
            "flow_imbalance": 30,
            "tank_level": 3,
            "tank_level_change_15m": -0.1,
            "demand_total": 12000,
            "hour_sin": 0,
            "hour_cos": 1,
            "sensor_missing_count": 0,
            "sensor_availability_ratio": 1,
        },
    )
    assert response.status_code == 503
    assert response.json()["detail"]["code"] == "MODEL_NOT_AVAILABLE"


def test_invalid_manual_payload_is_safe(client):
    response = client.post("/api/v1/predict/manual", json={"timestamp": "bad"})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_inspection_creation_requires_authentication(client):
    response = client.post(
        "/api/v1/inspections",
        json={
            "pipeline_id": "demo",
            "technician": "ignored",
            "inspection_date": "2026-08-03",
            "inspection_type": "acoustic",
            "confirmed_leak": "not_determined",
            "repair_required": False,
            "repair_status": "inspection_required",
        },
    )
    assert response.status_code in {401, 403}
