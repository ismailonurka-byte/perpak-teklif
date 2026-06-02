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


def require_admin(user: CurrentUser) -> Kullanici:
    if user.rol != "ADMIN":
        raise HTTPException(status_code=403, detail="Yönetici yetkisi gerekli")
    return user


def require_satis_or_admin(user: CurrentUser) -> Kullanici:
    if user.rol not in ("ADMIN", "SATIS"):
        raise HTTPException(status_code=403, detail="Satış veya yönetici yetkisi gerekli")
    return user
