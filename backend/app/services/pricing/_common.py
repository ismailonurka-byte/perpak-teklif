"""Hesaplama servisleri için ortak yardımcılar."""
from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy.orm import Session

from app.db.models import BirimFiyatGenel, BirimFiyatOfset, GecisCarpan


def D(v) -> Decimal:
    """Güvenli Decimal'e çevirme."""
    if v is None or v == "":
        return Decimal("0")
    return Decimal(str(v))


def yuvarla(d: Decimal, ondalik: int = 2) -> Decimal:
    q = Decimal("1") if ondalik == 0 else Decimal("0." + "0" * ondalik)
    return d.quantize(q, rounding=ROUND_HALF_UP)


def birim_fiyat_genel(db: Session) -> BirimFiyatGenel:
    row = db.query(BirimFiyatGenel).filter(BirimFiyatGenel.id == 1).first()
    if not row:
        raise RuntimeError("birim_fiyat_genel tablosu boş — seed script çalıştırılmalı.")
    return row


def ofset_baski_tl(db: Session, gramaj: int) -> Decimal:
    row = db.query(BirimFiyatOfset).filter(BirimFiyatOfset.gramaj == gramaj).first()
    if not row:
        # En yakın gramajı kullan
        candidates = db.query(BirimFiyatOfset).all()
        if not candidates:
            raise RuntimeError("birim_fiyat_ofset tablosu boş.")
        nearest = min(candidates, key=lambda r: abs(r.gramaj - gramaj))
        return D(nearest.baski_tl)
    return D(row.baski_tl)


def gecis_carpan(db: Session, renk_sayisi: int) -> Decimal:
    row = db.query(GecisCarpan).filter(GecisCarpan.renk_sayisi == renk_sayisi).first()
    return D(row.carpan) if row else Decimal("0")
