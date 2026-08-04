from app.core.security import hash_password
from app.db.database import SessionLocal
from app.db.models import User


def test_security_headers_are_present(client):
    response = client.get("/api/v1/health")
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["referrer-policy"] == "strict-origin-when-cross-origin"
    assert "frame-ancestors 'none'" in response.headers["content-security-policy"]


def test_invalid_csv_is_rejected_safely(client):
    response = client.post(
        "/api/v1/predict/csv",
        files={"file": ("bad.csv", b"not,a,valid,schema\n1,2,3,4\n", "text/csv")},
    )
    assert response.status_code == 422
    assert "column" in response.json()["detail"].lower()


def test_wrong_csv_mime_type_is_rejected(client):
    response = client.post(
        "/api/v1/predict/csv",
        files={"file": ("sample.csv", b"Timestamp\n2019-01-01T00:00:00Z\n", "application/octet-stream")},
    )
    assert response.status_code == 422
    assert "content type" in response.json()["detail"].lower()


def test_technician_can_create_but_not_delete_inspection(client):
    with SessionLocal() as session:
        session.add(
            User(
                email="tech@example.com",
                password_hash=hash_password("strong-password-123"),
                role="technician",
                is_active=True,
            )
        )
        session.commit()

    login = client.post(
        "/api/v1/auth/login",
        json={"email": "tech@example.com", "password": "strong-password-123"},
    )
    assert login.status_code == 200
    csrf = client.cookies.get("pipeguard_csrf")
    assert csrf

    created = client.post(
        "/api/v1/inspections",
        headers={"X-CSRF-Token": csrf},
        json={
            "pipeline_id": "demo-pipe",
            "technician": "ignored-client-value",
            "inspection_date": "2026-08-03",
            "inspection_type": "acoustic",
            "confirmed_leak": "not_determined",
            "repair_required": False,
            "repair_status": "inspection_required",
            "notes": "Test observation; no confirmed leak."
        },
    )
    assert created.status_code == 201
    assert created.json()["technician"] == "tech@example.com"
    inspection_id = created.json()["id"]

    deleted = client.delete(
        f"/api/v1/inspections/{inspection_id}",
        headers={"X-CSRF-Token": csrf},
    )
    assert deleted.status_code == 403
