"""FastAPI dependency injection — auth ve DB için."""
import uuid
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.db.models import Kullanici
from app.db.session import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> Kullanici:
    creds_err = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Kimlik doğrulanamadı",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise creds_err
        user_id_str = payload.get("sub")
        if not user_id_str:
            raise creds_err
        user_id = uuid.UUID(user_id_str)
    except (JWTError, ValueError):
        raise creds_err

    user = db.query(Kullanici).filter(Kullanici.id == user_id, Kullanici.aktif.is_(True)).first()
    if not user:
        raise creds_err
    return user


CurrentUser = Annotated[Kullanici, Depends(get_current_user)]
DbSession = Annotated[Session, Depends(get_db)]


# ─── RBAC (dinamik izin) ────────────────────────────────────────────────────
# Not: import burada (fonksiyon seviyesinde değil modül sonunda) — circular import yok.
from app.core.rbac import etkin_izinler, is_admin  # noqa: E402


def require_permission(kod: str):
    """Belirli bir izni şart koşan dependency üretir. Örn: Depends(require_permission('teklif.create'))."""
    def dep(user: CurrentUser, db: DbSession) -> Kullanici:
        if kod not in etkin_izinler(db, user):
            raise HTTPException(status_code=403, detail=f"Bu işlem için yetkiniz yok ({kod})")
        return user
    return dep


def izin_kapsami(db: Session, user: Kullanici, kod: str) -> str | None:
    """Kullanıcının bir izin için etkin kapsamını döndürür ('own' | 'all' | None)."""
    return etkin_izinler(db, user).get(kod)


def require_admin(user: CurrentUser, db: DbSession) -> Kullanici:
    if not is_admin(db, user):
        raise HTTPException(status_code=403, detail="Yönetici yetkisi gerekli")
    return user


def require_satis_or_admin(user: CurrentUser, db: DbSession) -> Kullanici:
    # 'teklif.read' iznine sahip herkes (admin dahil) geçer.
    if "teklif.read" not in etkin_izinler(db, user):
        raise HTTPException(status_code=403, detail="Bu işlem için yetkiniz yok")
    return user
