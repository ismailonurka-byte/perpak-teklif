from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import CurrentUser, DbSession, require_admin
from app.core.security import hash_password
from app.db.models import Kullanici
from app.schemas.kullanici import KullaniciCreate, KullaniciOut, KullaniciUpdate

router = APIRouter()


@router.get("", response_model=list[KullaniciOut])
def liste(db: DbSession, _: Kullanici = Depends(require_admin)):
    return db.query(Kullanici).order_by(Kullanici.ad_soyad).all()


@router.post("", response_model=KullaniciOut, status_code=201)
def olustur(payload: KullaniciCreate, db: DbSession, _: Kullanici = Depends(require_admin)):
    if db.query(Kullanici).filter(Kullanici.kullanici_adi == payload.kullanici_adi).first():
        raise HTTPException(status_code=400, detail="Kullanıcı adı zaten var")
    u = Kullanici(
        kullanici_adi=payload.kullanici_adi,
        sifre_hash=hash_password(payload.sifre),
        ad_soyad=payload.ad_soyad,
        rol=payload.rol,
        telefon=payload.telefon,
        email=payload.email,
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


@router.patch("/{user_id}", response_model=KullaniciOut)
def guncelle(
    user_id: UUID,
    payload: KullaniciUpdate,
    db: DbSession,
    _: Kullanici = Depends(require_admin),
):
    u = db.query(Kullanici).filter(Kullanici.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    data = payload.model_dump(exclude_unset=True)
    if "sifre" in data:
        u.sifre_hash = hash_password(data.pop("sifre"))
    for k, v in data.items():
        setattr(u, k, v)
    db.commit()
    db.refresh(u)
    return u


@router.delete("/{user_id}", status_code=204)
def sil(user_id: UUID, db: DbSession, _: Kullanici = Depends(require_admin)):
    u = db.query(Kullanici).filter(Kullanici.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    u.aktif = False  # soft delete
    db.commit()
