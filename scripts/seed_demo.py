from pathlib import Path
import os
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.core.security import hash_password
from app.db.database import Base, SessionLocal, engine
from app.db.models import InspectionRecord, User


def main() -> None:
    Base.metadata.create_all(bind=engine)
    email = os.getenv("DEMO_TECHNICIAN_EMAIL", "technician@pipeguard.local")
    password = os.getenv("DEMO_TECHNICIAN_PASSWORD")
    if not password:
        raise SystemExit("Set DEMO_TECHNICIAN_PASSWORD before seeding.")
    with SessionLocal() as session:
        if session.query(User).filter(User.email == email).first() is None:
            session.add(
                User(
                    email=email,
                    password_hash=hash_password(password),
                    role="technician",
                    is_active=True,
                )
            )
        if session.query(InspectionRecord).count() == 0:
            session.add(
                InspectionRecord(
                    pipeline_id="demo-zone-4",
                    technician=email,
                    inspection_type="acoustic",
                    confirmed_leak="not_determined",
                    repair_required=False,
                    repair_status="inspection_required",
                    notes="Demonstration record. No confirmed leak.",
                )
            )
        session.commit()
    print("Demo data seeded.")


if __name__ == "__main__":
    main()
