"""Initial PipeGuard schema.

Revision ID: 0001
Revises:
"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(320), nullable=False),
        sa.Column("password_hash", sa.String(512), nullable=False),
        sa.Column("role", sa.String(32), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("email"),
    )
    op.create_index("ix_users_email", "users", ["email"])
    op.create_table(
        "pipe_assets",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("external_id", sa.String(128), nullable=False),
        sa.Column("pressure_zone", sa.String(128)),
        sa.Column("status", sa.String(64)),
        sa.Column("length_m", sa.Float()),
        sa.Column("diameter_mm", sa.Float()),
        sa.Column("material", sa.String(64)),
        sa.Column("installation_year", sa.Integer()),
        sa.Column("geometry_json", sa.JSON()),
        sa.Column("source", sa.String(128), nullable=False),
        sa.UniqueConstraint("external_id"),
    )
    op.create_index("ix_pipe_assets_external_id", "pipe_assets", ["external_id"])
    op.create_table(
        "historical_breaks",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("pipe_asset_id", sa.Integer(), sa.ForeignKey("pipe_assets.id")),
        sa.Column("break_date", sa.Date()),
        sa.Column("break_type", sa.String(16)),
        sa.Column("status", sa.String(32)),
        sa.Column("geometry_json", sa.JSON()),
        sa.Column("match_distance_m", sa.Float()),
    )
    op.create_table(
        "inspection_records",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("pipeline_id", sa.String(128), nullable=False),
        sa.Column("technician", sa.String(320), nullable=False),
        sa.Column("inspection_date", sa.Date(), nullable=False),
        sa.Column("inspection_type", sa.String(64), nullable=False),
        sa.Column("camera_result", sa.Text()),
        sa.Column("acoustic_result", sa.Text()),
        sa.Column("ultrasonic_result", sa.Text()),
        sa.Column("visible_damage", sa.Text()),
        sa.Column("confirmed_leak", sa.String(32), nullable=False),
        sa.Column("repair_required", sa.Boolean(), nullable=False),
        sa.Column("repair_status", sa.String(64), nullable=False),
        sa.Column("notes", sa.Text()),
        sa.Column("follow_up_date", sa.Date()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_inspection_records_pipeline_id", "inspection_records", ["pipeline_id"])
    op.create_table(
        "inspection_attachments",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("inspection_id", sa.Integer(), sa.ForeignKey("inspection_records.id"), nullable=False),
        sa.Column("safe_filename", sa.String(255), nullable=False),
        sa.Column("content_type", sa.String(128), nullable=False),
        sa.Column("byte_size", sa.Integer(), nullable=False),
        sa.Column("storage_key", sa.String(512), nullable=False),
        sa.Column("sha256", sa.String(64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_table(
        "prediction_audit",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("request_id", sa.String(64), nullable=False),
        sa.Column("data_mode", sa.String(32), nullable=False),
        sa.Column("model_version", sa.String(64), nullable=False),
        sa.Column("status", sa.String(64), nullable=False),
        sa.Column("probability", sa.Float()),
        sa.Column("schema_hash", sa.String(64)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_prediction_audit_request_id", "prediction_audit", ["request_id"])
    op.create_table(
        "model_registry",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("model_version", sa.String(64), nullable=False),
        sa.Column("artifact_hash", sa.String(64)),
        sa.Column("schema_hash", sa.String(64), nullable=False),
        sa.Column("approval_status", sa.Boolean(), nullable=False),
        sa.Column("metadata_json", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("model_version"),
    )
    op.create_table(
        "application_events",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("event_type", sa.String(64), nullable=False),
        sa.Column("actor_user_id", sa.Integer(), sa.ForeignKey("users.id")),
        sa.Column("request_id", sa.String(64)),
        sa.Column("summary", sa.String(512), nullable=False),
        sa.Column("metadata_json", sa.JSON()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_application_events_event_type", "application_events", ["event_type"])


def downgrade() -> None:
    for table in [
        "application_events",
        "model_registry",
        "prediction_audit",
        "inspection_attachments",
        "inspection_records",
        "historical_breaks",
        "pipe_assets",
        "users",
    ]:
        op.drop_table(table)
