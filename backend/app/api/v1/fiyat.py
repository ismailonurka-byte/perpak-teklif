"""Birim fiyat yönetimi — yalnız ADMIN erişebilir.

3 tablo:
- birim_fiyat_genel   : tek satır (lak, sıvama, kesim, yapıştırma, flekso, koli dikiş)
- birim_fiyat_ofset   : gramaj → baskı TL satırları
- gecis_carpan        : renk sayısı → çarpan satırları
"""
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.deps import DbSession, require_admin
from app.db.models import BirimFiyatGenel, BirimFiyatOfset, GecisCarpan, Kullanici

router = APIRouter()


# ─── ŞEMA ────────────────────────────────────────────────────────────────

class BirimFiyatGenelOut(BaseModel):
    lak_tl_m2: Decimal
    sivama_tl_m2: Decimal
    kesim_tl: Decimal
    yapistirma_tl_ad: Decimal
    flekso_baski_kesim_tl: Decimal
    flekso_kesim_tl: Decimal
    flekso_yapistirma_tl_ad: Decimal
    koli_dikis_birim_tl: Decimal

    model_config = {"from_attributes": True}


class BirimFiyatGenelUpdate(BaseModel):
    lak_tl_m2: Decimal | None = None
    sivama_tl_m2: Decimal | None = None
    kesim_tl: Decimal | None = None
    yapistirma_tl_ad: Decimal | None = None
    flekso_baski_kesim_tl: Decimal | None = None
    flekso_kesim_tl: Decimal | None = None
    flekso_yapistirma_tl_ad: Decimal | None = None
    koli_dikis_birim_tl: Decimal | None = None


class OfsetSatir(BaseModel):
    gramaj: int
    baski_tl: Decimal

    model_config = {"from_attributes": True}


class CarpanSatir(BaseModel):
    renk_sayisi: int
    carpan: Decimal

    model_config = {"from_attributes": True}


# ─── GENEL FİYATLAR ─────────────────────────────────────────────────────

@router.get("/genel", response_model=BirimFiyatGenelOut)
def genel_oku(db: DbSession, _: Kullanici = Depends(require_admin)):
    row = db.query(BirimFiyatGenel).filter(BirimFiyatGenel.id == 1).first()
    if not row:
        raise HTTPException(status_code=404, detail="Birim fiyat tablosu bulunamadı")
    return row


@router.patch("/genel", response_model=BirimFiyatGenelOut)
def genel_guncelle(
    payload: BirimFiyatGenelUpdate,
    db: DbSession,
    _: Kullanici = Depends(require_admin),
):
    row = db.query(BirimFiyatGenel).filter(BirimFiyatGenel.id == 1).first()
    if not row:
        raise HTTPException(status_code=404, detail="Birim fiyat tablosu bulunamadı")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return row


# ─── OFSET BASKI TL ──────────────────────────────────────────────────────

@router.get("/ofset", response_model=list[OfsetSatir])
def ofset_liste(db: DbSession, _: Kullanici = Depends(require_admin)):
    return db.query(BirimFiyatOfset).order_by(BirimFiyatOfset.gramaj).all()


@router.put("/ofset/{gramaj}", response_model=OfsetSatir)
def ofset_kaydet(gramaj: int, baski_tl: Decimal, db: DbSession, _: Kullanici = Depends(require_admin)):
    row = db.query(BirimFiyatOfset).filter(BirimFiyatOfset.gramaj == gramaj).first()
    if row:
        row.baski_tl = baski_tl
    else:
        row = BirimFiyatOfset(gramaj=gramaj, baski_tl=baski_tl)
        db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/ofset/{gramaj}", status_code=204)
def ofset_sil(gramaj: int, db: DbSession, _: Kullanici = Depends(require_admin)):
    row = db.query(BirimFiyatOfset).filter(BirimFiyatOfset.gramaj == gramaj).first()
    if not row:
        raise HTTPException(status_code=404, detail="Satır bulunamadı")
    db.delete(row)
    db.commit()


# ─── GEÇİŞ ÇARPANI ───────────────────────────────────────────────────────

@router.get("/carpan", response_model=list[CarpanSatir])
def carpan_liste(db: DbSession, _: Kullanici = Depends(require_admin)):
    return db.query(GecisCarpan).order_by(GecisCarpan.renk_sayisi).all()


@router.put("/carpan/{renk_sayisi}", response_model=CarpanSatir)
def carpan_kaydet(renk_sayisi: int, carpan: Decimal, db: DbSession, _: Kullanici = Depends(require_admin)):
    row = db.query(GecisCarpan).filter(GecisCarpan.renk_sayisi == renk_sayisi).first()
    if row:
        row.carpan = carpan
    else:
        row = GecisCarpan(renk_sayisi=renk_sayisi, carpan=carpan)
        db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/carpan/{renk_sayisi}", status_code=204)
def carpan_sil(renk_sayisi: int, db: DbSession, _: Kullanici = Depends(require_admin)):
    row = db.query(GecisCarpan).filter(GecisCarpan.renk_sayisi == renk_sayisi).first()
    if not row:
        raise HTTPException(status_code=404, detail="Satır bulunamadı")
    db.delete(row)
    db.commit()
