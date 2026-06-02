import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status
from jose import JWTError

from app.core.deps import CurrentUser, DbSession
from app.core.security import (
    create_access_token, create_refresh_token, decode_token, verify_password,
)
from app.db.models import Kullanici
from app.schemas.auth import (
    KullaniciOzet, LoginRequest, LoginResponse, RefreshRequest, TokenPair,
)

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: DbSession):
    user = (
        db.query(Kullanici)
        .filter(Kullanici.kullanici_adi == payload.kullanici_adi)
        .first()
    )
    if not user or not user.aktif or not verify_password(payload.sifre, user.sifre_hash):
        raise HTTPException(status_code=401, detail="Kullanıcı adı veya şifre hatalı")

    user.son_giris = datetime.now(timezone.utc)
    db.commit()

    return LoginResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
        kullanici=KullaniciOzet.model_validate(user),
    )


@router.post("/refresh", response_model=TokenPair)
def refresh(payload: RefreshRequest, db: DbSession):
    try:
        data = decode_token(payload.refresh_token)
        if data.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Geçersiz token")
        user_id = uuid.UUID(data.get("sub"))
    except (JWTError, ValueError, TypeError):
        raise HTTPException(status_code=401, detail="Geçersiz token")

    user = db.query(Kullanici).filter(Kullanici.id == user_id, Kullanici.aktif.is_(True)).first()
    if not user:
        raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı")

    return TokenPair(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.get("/me", response_model=KullaniciOzet)
def me(user: CurrentUser):
    return KullaniciOzet.model_validate(user)
