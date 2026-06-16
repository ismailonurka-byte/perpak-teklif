"""Tanımlar — yönetilebilir master kayıtlar (şimdilik Baskı Makineleri).

Baskı makineleri = ofset baski_turu tablosu. Her makine:
- tip: DAHILI | FASON (bilgi)
- baski_kalip_tl, gecis_carpan: teklifte otomatik dolan makine bazlı varsayılanlar.
"""
import re
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.deps import DbSession, require_permission
from app.db.models import BaskiTuru, KartonCinsi, Kullanici, OlukluKalite

router = APIRouter()


class MakineOut(BaseModel):
    kod: str
    ad: str
    tip: str
    baski_kalip_tl: Decimal
    gecis_carpan: Decimal
    aktif: bool

    model_config = {"from_attributes": True}


class MakineCreate(BaseModel):
    ad: str
    tip: str = "DAHILI"
    baski_kalip_tl: Decimal = Decimal("0")
    gecis_carpan: Decimal = Decimal("0")


class MakineUpdate(BaseModel):
    ad: str | None = None
    tip: str | None = None
    baski_kalip_tl: Decimal | None = None
    gecis_carpan: Decimal | None = None
    aktif: bool | None = None


def _kod_uret(ad: str) -> str:
    k = re.sub(r"[^A-Z0-9]+", "_", ad.upper().strip()).strip("_")
    return k or "MAKINE"


@router.get("/baski-makinesi", response_model=list[MakineOut])
def liste(db: DbSession, _: Kullanici = Depends(require_permission("master.read"))):
    return db.query(BaskiTuru).order_by(BaskiTuru.ad).all()


@router.post("/baski-makinesi", response_model=MakineOut, status_code=201)
def olustur(payload: MakineCreate, db: DbSession, _: Kullanici = Depends(require_permission("master.update"))):
    if payload.tip not in ("DAHILI", "FASON"):
        raise HTTPException(status_code=400, detail="tip 'DAHILI' veya 'FASON' olmalı")
    kod = _kod_uret(payload.ad)
    # Kod çakışırsa sonuna sayı ekle
    if db.query(BaskiTuru).filter(BaskiTuru.kod == kod).first():
        i = 2
        while db.query(BaskiTuru).filter(BaskiTuru.kod == f"{kod}_{i}").first():
            i += 1
        kod = f"{kod}_{i}"
    m = BaskiTuru(
        kod=kod, ad=payload.ad, tip=payload.tip,
        baski_kalip_tl=payload.baski_kalip_tl, gecis_carpan=payload.gecis_carpan, aktif=True,
    )
    db.add(m)
    db.commit()
    db.refresh(m)
    return m


@router.patch("/baski-makinesi/{kod}", response_model=MakineOut)
def guncelle(kod: str, payload: MakineUpdate, db: DbSession, _: Kullanici = Depends(require_permission("master.update"))):
    m = db.query(BaskiTuru).filter(BaskiTuru.kod == kod).first()
    if not m:
        raise HTTPException(status_code=404, detail="Makine bulunamadı")
    if payload.tip is not None and payload.tip not in ("DAHILI", "FASON"):
        raise HTTPException(status_code=400, detail="tip 'DAHILI' veya 'FASON' olmalı")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(m, k, v)
    db.commit()
    db.refresh(m)
    return m


@router.delete("/baski-makinesi/{kod}", status_code=204)
def sil(kod: str, db: DbSession, _: Kullanici = Depends(require_permission("master.update"))):
    m = db.query(BaskiTuru).filter(BaskiTuru.kod == kod).first()
    if not m:
        raise HTTPException(status_code=404, detail="Makine bulunamadı")
    # Kalıcı silme yerine pasife al (eski tekliflerin spec'i bu kodu referans alabilir)
    m.aktif = False
    db.commit()


# ─────────────────────────────────────────────────────────────────────────────
# KARTON (MALZEME) CİNSİ
# ─────────────────────────────────────────────────────────────────────────────

class KartonOut(BaseModel):
    kod: str
    ad: str
    aktif: bool
    model_config = {"from_attributes": True}


class KartonCreate(BaseModel):
    ad: str


class KartonUpdate(BaseModel):
    ad: str | None = None
    aktif: bool | None = None


@router.get("/karton-cinsi", response_model=list[KartonOut])
def karton_liste(db: DbSession, _: Kullanici = Depends(require_permission("master.read"))):
    return db.query(KartonCinsi).order_by(KartonCinsi.sira, KartonCinsi.ad).all()


@router.post("/karton-cinsi", response_model=KartonOut, status_code=201)
def karton_olustur(payload: KartonCreate, db: DbSession, _: Kullanici = Depends(require_permission("master.update"))):
    kod = _kod_uret(payload.ad)
    if db.query(KartonCinsi).filter(KartonCinsi.kod == kod).first():
        i = 2
        while db.query(KartonCinsi).filter(KartonCinsi.kod == f"{kod}_{i}").first():
            i += 1
        kod = f"{kod}_{i}"
    row = KartonCinsi(kod=kod, ad=payload.ad, aktif=True)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.patch("/karton-cinsi/{kod}", response_model=KartonOut)
def karton_guncelle(kod: str, payload: KartonUpdate, db: DbSession, _: Kullanici = Depends(require_permission("master.update"))):
    row = db.query(KartonCinsi).filter(KartonCinsi.kod == kod).first()
    if not row:
        raise HTTPException(status_code=404, detail="Karton cinsi bulunamadı")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/karton-cinsi/{kod}", status_code=204)
def karton_sil(kod: str, db: DbSession, _: Kullanici = Depends(require_permission("master.update"))):
    row = db.query(KartonCinsi).filter(KartonCinsi.kod == kod).first()
    if not row:
        raise HTTPException(status_code=404, detail="Karton cinsi bulunamadı")
    row.aktif = False
    db.commit()


# ─────────────────────────────────────────────────────────────────────────────
# OLUKLU CİNSİ (kalite). kod = "T090/S080/ - E" gibi (slash içerir → path değil body).
# ─────────────────────────────────────────────────────────────────────────────

class OlukluOut(BaseModel):
    kod: str
    tip: str
    aciklama: str | None = None
    aktif: bool
    model_config = {"from_attributes": True}


class OlukluUpsert(BaseModel):
    kod: str
    tip: str = ""
    aciklama: str | None = None
    aktif: bool = True


class OlukluKod(BaseModel):
    kod: str


@router.get("/oluklu-kalite", response_model=list[OlukluOut])
def oluklu_liste(db: DbSession, _: Kullanici = Depends(require_permission("master.read"))):
    return db.query(OlukluKalite).order_by(OlukluKalite.kod).all()


@router.post("/oluklu-kalite", response_model=OlukluOut)
def oluklu_upsert(payload: OlukluUpsert, db: DbSession, _: Kullanici = Depends(require_permission("master.update"))):
    """Kod varsa günceller, yoksa oluşturur (kodda '/' olabildiği için body ile)."""
    kod = payload.kod.strip()
    if not kod:
        raise HTTPException(status_code=400, detail="Oluklu kodu boş olamaz")
    row = db.query(OlukluKalite).filter(OlukluKalite.kod == kod).first()
    if row:
        row.tip = payload.tip
        row.aciklama = payload.aciklama
        row.aktif = payload.aktif
    else:
        row = OlukluKalite(kod=kod, tip=payload.tip, aciklama=payload.aciklama, aktif=payload.aktif)
        db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.post("/oluklu-kalite/sil", status_code=204)
def oluklu_sil(payload: OlukluKod, db: DbSession, _: Kullanici = Depends(require_permission("master.update"))):
    row = db.query(OlukluKalite).filter(OlukluKalite.kod == payload.kod).first()
    if not row:
        raise HTTPException(status_code=404, detail="Oluklu cinsi bulunamadı")
    row.aktif = False
    db.commit()
