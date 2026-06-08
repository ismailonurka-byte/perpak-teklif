"""RBAC çekirdeği: katalog senkronu, rol seed'i ve etkin izin çözümü.

- katalog_senkronize: permissions.KATALOG → DB `izin` tablosu (upsert).
- rolleri_seed_et: 'Yönetici' sistem rolü (tüm izinler) + opsiyonel 'Satış' rolü;
  mevcut kullanici.rol string'lerini yeni rollere bağlar (geriye dönük uyum).
- etkin_izinler: kullanıcının tüm rollerinden gelen izinlerin birleşimi (scope dahil).
"""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.core import permissions as perm
from app.db.models import Izin, Kullanici, KullaniciRol, Rol, RolIzin


def katalog_senkronize(db: Session) -> None:
    """Koddaki izin kataloğunu DB'ye upsert eder. Yeni ekran → yeni izin otomatik görünür."""
    mevcut = {i.kod: i for i in db.query(Izin).all()}
    for p in perm.KATALOG:
        row = mevcut.get(p.kod)
        if row is None:
            db.add(Izin(
                kod=p.kod, gorunen_ad=p.gorunen_ad, modul=p.modul, ekran=p.ekran,
                aksiyon=p.aksiyon, aciklama=p.aciklama, kapsam_destekler=p.kapsam, sira=p.sira,
            ))
        else:
            row.gorunen_ad = p.gorunen_ad
            row.modul = p.modul
            row.ekran = p.ekran
            row.aksiyon = p.aksiyon
            row.aciklama = p.aciklama
            row.kapsam_destekler = p.kapsam
            row.sira = p.sira
    db.commit()


def rolleri_seed_et(db: Session) -> None:
    """Yönetici (sistem) rolünü garanti eder; mevcut admin/satış kullanıcılarını bağlar."""
    # ── Yönetici (sistem rolü) — HER ZAMAN tüm izinlere sahip ──
    yonetici = db.query(Rol).filter(Rol.ad == perm.YONETICI_ROL).first()
    if yonetici is None:
        yonetici = Rol(ad=perm.YONETICI_ROL, aciklama="Tam yetkili sistem yöneticisi", sistem_rol=True)
        db.add(yonetici)
        db.flush()
    # sistem rolü: tüm katalog izinlerini 'all' kapsamla senkronla
    mevcut_kodlar = {ri.izin_kod for ri in db.query(RolIzin).filter(RolIzin.rol_id == yonetici.id).all()}
    for kod in perm.KATALOG_KODLARI:
        if kod not in mevcut_kodlar:
            db.add(RolIzin(rol_id=yonetici.id, izin_kod=kod, kapsam="all"))

    # ── Satış (yardımcı varsayılan rol) — yalnız yoksa oluştur ──
    satis = db.query(Rol).filter(Rol.ad == perm.SATIS_ROL).first()
    if satis is None:
        satis = Rol(ad=perm.SATIS_ROL, aciklama="Satış temsilcisi (kendi teklifleri)")
        db.add(satis)
        db.flush()
        for kod, kapsam in perm.SATIS_VARSAYILAN:
            if kod in perm.KATALOG_KODLARI:
                db.add(RolIzin(rol_id=satis.id, izin_kod=kod, kapsam=kapsam))

    db.commit()

    # ── Mevcut kullanıcıları (henüz rolü olmayan) eski rol string'ine göre bağla ──
    atanmis = {kr.kullanici_id for kr in db.query(KullaniciRol).all()}
    for u in db.query(Kullanici).all():
        if u.id in atanmis:
            continue
        hedef = None
        if u.rol == "ADMIN":
            hedef = yonetici
        elif u.rol == "SATIS":
            hedef = satis
        if hedef is not None:
            db.add(KullaniciRol(kullanici_id=u.id, rol_id=hedef.id))
    db.commit()


def _kullanici_sistem_admin(db: Session, user: Kullanici) -> bool:
    return (
        db.query(KullaniciRol)
        .join(Rol, Rol.id == KullaniciRol.rol_id)
        .filter(KullaniciRol.kullanici_id == user.id, Rol.sistem_rol.is_(True), Rol.aktif.is_(True))
        .first()
        is not None
    )


def etkin_izinler(db: Session, user: Kullanici) -> dict[str, str | None]:
    """Kullanıcının tüm aktif rollerinden gelen izinler. {izin_kod: kapsam}.

    Sistem (Yönetici) rolü → tüm katalog izinleri 'all' kapsamla.
    Çoklu rol: aynı izin farklı kapsamla gelirse en geniş kazanır (all > own > None).
    """
    if _kullanici_sistem_admin(db, user):
        return {kod: "all" for kod in perm.KATALOG_KODLARI}

    rows = (
        db.query(RolIzin.izin_kod, RolIzin.kapsam)
        .join(Rol, Rol.id == RolIzin.rol_id)
        .join(KullaniciRol, KullaniciRol.rol_id == Rol.id)
        .filter(KullaniciRol.kullanici_id == user.id, Rol.aktif.is_(True))
        .all()
    )
    sonuc: dict[str, str | None] = {}
    rank = {None: 0, "own": 1, "all": 2}
    for kod, kapsam in rows:
        if kod not in sonuc or rank.get(kapsam, 0) > rank.get(sonuc[kod], 0):
            sonuc[kod] = kapsam
    return sonuc


def is_admin(db: Session, user: Kullanici) -> bool:
    return _kullanici_sistem_admin(db, user)


def kullanici_rolleri(db: Session, user: Kullanici) -> list[str]:
    """Kullanıcının atandığı aktif rol adları."""
    rows = (
        db.query(Rol.ad)
        .join(KullaniciRol, KullaniciRol.rol_id == Rol.id)
        .filter(KullaniciRol.kullanici_id == user.id, Rol.aktif.is_(True))
        .order_by(Rol.ad)
        .all()
    )
    return [r[0] for r in rows]
