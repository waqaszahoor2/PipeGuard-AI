from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
import hmac
import secrets

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import Cookie, Depends, Header, HTTPException, Request, status
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.database import get_db
from app.db.models import User


SESSION_COOKIE = "pipeguard_session"
CSRF_COOKIE = "pipeguard_csrf"
password_hasher = PasswordHasher()


@dataclass(frozen=True)
class CurrentUser:
    id: int
    email: str
    role: str


def hash_password(password: str) -> str:
    if len(password) < 12:
        raise ValueError("Password must contain at least 12 characters")
    return password_hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return password_hasher.verify(password_hash, password)
    except VerifyMismatchError:
        return False


def serializer() -> URLSafeTimedSerializer:
    settings = get_settings()
    return URLSafeTimedSerializer(settings.session_secret, salt="pipeguard-session-v1")


def create_session_token(user: User) -> str:
    return serializer().dumps({"sub": user.id, "email": user.email, "role": user.role})


def decode_session_token(token: str) -> dict:
    settings = get_settings()
    try:
        return serializer().loads(token, max_age=settings.access_session_minutes * 60)
    except SignatureExpired as exc:
        raise HTTPException(status_code=401, detail="Session expired") from exc
    except BadSignature as exc:
        raise HTTPException(status_code=401, detail="Invalid session") from exc


def create_csrf_token() -> str:
    return secrets.token_urlsafe(32)


def require_csrf(
    request: Request,
    csrf_cookie: str | None = Cookie(default=None, alias=CSRF_COOKIE),
    csrf_header: str | None = Header(default=None, alias="X-CSRF-Token"),
) -> None:
    if request.method in {"GET", "HEAD", "OPTIONS"}:
        return
    if not csrf_cookie or not csrf_header or not hmac.compare_digest(csrf_cookie, csrf_header):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="CSRF validation failed")


def get_current_user(
    session_token: str | None = Cookie(default=None, alias=SESSION_COOKIE),
    db: Session = Depends(get_db),
) -> CurrentUser:
    if not session_token:
        raise HTTPException(status_code=401, detail="Authentication required")
    payload = decode_session_token(session_token)
    user = db.get(User, int(payload["sub"]))
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Authentication required")
    return CurrentUser(id=user.id, email=user.email, role=user.role)


def require_roles(*roles: str):
    def dependency(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permission")
        return user

    return dependency
