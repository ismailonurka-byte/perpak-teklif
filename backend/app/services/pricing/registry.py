"""Hesaplama fonksiyonu kayıt defteri — kalem_tipi.hesaplama_fn'i bu sözlükten çözer."""
from dataclasses import dataclass, field, asdict
from decimal import Decimal

from sqlalchemy.orm import Session

from .kutu_ofset import calc_kutu_ofset
from .kutu_flekso import calc_kutu_flekso
from .koli import calc_koli


@dataclass
class PricingResult:
    birim_maliyet: Decimal
    birim_satis: Decimal
    toplam_satis: Decimal
    detay: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "birim_maliyet": float(self.birim_maliyet),
            "birim_satis": float(self.birim_satis),
            "toplam_satis": float(self.toplam_satis),
            "detay": self.detay,
        }


# Fonksiyon adı → callable. Yeni tip eklemek için buraya ekle.
PRICING_FUNCTIONS = {
    "calc_kutu_ofset": calc_kutu_ofset,
    "calc_kutu_flekso": calc_kutu_flekso,
    "calc_koli": calc_koli,
}


def calculate(kalem_tipi_kod: str, spec: dict, db: Session) -> PricingResult:
    """Tipe göre uygun hesaplama fonksiyonunu çağırır."""
    from app.db.models import KalemTipi
    tip = db.query(KalemTipi).filter(KalemTipi.kod == kalem_tipi_kod).first()
    if not tip:
        raise ValueError(f"Bilinmeyen kalem tipi: {kalem_tipi_kod}")
    fn = PRICING_FUNCTIONS.get(tip.hesaplama_fn)
    if not fn:
        raise ValueError(f"Hesaplama fonksiyonu bulunamadı: {tip.hesaplama_fn}")
    return fn(spec, db)
