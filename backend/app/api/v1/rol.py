"""Rol & izin yönetimi (dinamik RBAC) — yalnız 'rol.manage' iznine sahip kullanıcılar."""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import DbSession, require_permission
from app.db.models import Izin, Kullanici, KullaniciRol, Rol, RolIzin
from app.schemas.rol import (
    IzinOut, KullaniciRollerIn, RolCreate, RolIzinIn, RolOut, RolUpdate,
)

router = APIRouter()

_yetki = Depends(require_permission("rol.manage"))


@router.get("/izinler", response_model=list[IzinOut])
def izin_katalogu(db: DbSession, _: Kullanici = _yetki):
    """Tüm izin kataloğu (modül/ekran/aksiyon/amaç ile). Frontend modül-ekran gruplar."""
    return db.query(Izin).order_by(Izin.sira, Izin.kod).all()


@router.get("", response_model=list[RolOut])
def roller(db: DbSession, _: Kullanici = _yetki):
    return db.query(Rol).order_by(Rol.sistem_rol.desc(), Rol.ad).all()


@router.post("", response_model=RolOut, status_code=201)
def rol_olustur(payload: RolCreate, db: DbSession, _: Kullanici = _yetki):
    if db.query(Rol).filter(Rol.ad == payload.ad).first():
        raise HTTPException(status_code=400, detail="Bu adda bir rol zaten var")
    r = Rol(ad=payload.ad, aciklama=payload.aciklama)
    db.add(r)
    db.commit()
    db.refresh(r)
    return r


@router.patch("/{rol_id}", response_model=RolOut)
def rol_guncelle(rol_id: UUID, payload: RolUpdate, db: DbSession, _: Kullanici = _yetki):
    r = db.query(Rol).filter(Rol.id == rol_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Rol bulunamadı")
    data = payload.model_dump(exclude_unset=True)
    if "ad" in data and data["ad"] != r.ad and db.query(Rol).filter(Rol.ad == data["ad"]).first():
        raise HTTPException(status_code=400, detail="Bu adda bir rol zaten var")
    if r.sistem_rol and "aktif" in data and not data["aktif"]:
        raise HTTPException(status_code=400, detail="Sistem rolü pasife alınamaz")
    for k, v in data.items():
        setattr(r, k, v)
    db.commit()
    db.refresh(r)
    return r


@router.put("/{rol_id}/izinler", response_model=RolOut)
def rol_izin_ata(rol_id: UUID, izinler: list[RolIzinIn], db: DbSession, _: Kullanici = _yetki):
    """Rolün izinlerini topluca ayarlar (verilen liste = yeni durum)."""
    r = db.query(Rol).filter(Rol.id == rol_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Rol bulunamadı")
    if r.sistem_rol:
        raise HTTPException(status_code=400, detail="Sistem rolünün izinleri değiştirilemez (her zaman tam yetkili)")

    gecerli = {i.kod: i for i in db.query(Izin).all()}
    db.query(RolIzin).filter(RolIzin.rol_id == rol_id).delete()
    for item in izinler:
        if item.izin_kod not in gecerli:
            continue  # bilinmeyen izin kodu atlanır
        kapsam = item.kapsam if gecerli[item.izin_kod].kapsam_destekler else None
        db.add(RolIzin(rol_id=rol_id, izin_kod=item.izin_kod, kapsam=kapsam))
    db.commit()
    db.refresh(r)
    return r


@router.delete("/{rol_id}", status_code=204)
def rol_sil(rol_id: UUID, db: DbSession, _: Kullanici = _yetki):
    r = db.query(Rol).filter(Rol.id == rol_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Rol bulunamadı")
    if r.sistem_rol:
        raise HTTPException(status_code=400, detail="Sistem rolü silinemez")
    db.delete(r)  # rol_izin & kullanici_rol cascade ile silinir
    db.commit()


# ── Kullanıcı ↔ Rol atama (kullanici.manage izni) ──
@router.get("/kullanici/{user_id}", response_model=list[UUID])
def kullanici_rolleri(user_id: UUID, db: DbSession, _: Kullanici = Depends(require_permission("kullanici.manage"))):
    return [kr.rol_id for kr in db.query(KullaniciRol).filter(KullaniciRol.kullanici_id == user_id).all()]


@router.put("/kullanici/{user_id}", status_code=204)
def kullanici_rol_ata(
    user_id: UUID, payload: KullaniciRollerIn, db: DbSession,
    _: Kullanici = Depends(require_permission("kullanici.manage")),
):
    if not db.query(Kullanici).filter(Kullanici.id == user_id).first():
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    gecerli_rol = {r.id for r in db.query(Rol).all()}
    db.query(KullaniciRol).filter(KullaniciRol.kullanici_id == user_id).delete()
    for rid in payload.rol_ids:
        if rid in gecerli_rol:
            db.add(KullaniciRol(kullanici_id=user_id, rol_id=rid))
    db.commit()
