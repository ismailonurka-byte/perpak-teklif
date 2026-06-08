from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import DbSession, require_permission
from app.core.rbac import kullanici_rolleri
from app.core.security import hash_password
from app.db.models import Kullanici
from app.schemas.kullanici import KullaniciCreate, KullaniciOut, KullaniciUpdate

router = APIRouter()


def _ile_roller(db, u: Kullanici) -> Kullanici:
    """ORM nesnesine geçici roller alanı ekler (KullaniciOut.roller için)."""
    u.roller = kullanici_rolleri(db, u)
    return u


@router.get("", response_model=list[KullaniciOut])
def liste(db: DbSession, _: Kullanici = Depends(require_permission("kullanici.manage"))):
    rows = db.query(Kullanici).order_by(Kullanici.ad_soyad).all()
    return [_ile_roller(db, u) for u in rows]


@router.post("", response_model=KullaniciOut, status_code=201)
def olustur(payload: KullaniciCreate, db: DbSession, _: Kullanici = Depends(require_permission("kullanici.manage"))):
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
    return _ile_roller(db, u)


@router.patch("/{user_id}", response_model=KullaniciOut)
def guncelle(
    user_id: UUID,
    payload: KullaniciUpdate,
    db: DbSession,
    _: Kullanici = Depends(require_permission("kullanici.manage")),
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
    return _ile_roller(db, u)


@router.delete("/{user_id}", status_code=204)
def sil(user_id: UUID, db: DbSession, _: Kullanici = Depends(require_permission("kullanici.manage"))):
    u = db.query(Kullanici).filter(Kullanici.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    u.aktif = False  # soft delete
    db.commit()
