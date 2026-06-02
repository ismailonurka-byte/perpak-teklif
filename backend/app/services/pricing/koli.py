"""KOLİ fiyat hesabı — KOLİ 1 sayfasındaki KOLİ HESAPLAMA bloğundan birebir.

Excel referans formülleri:
    L13 = (L5*M5*L7)/1_000_000        # LEVHA
    L14 = N11                          # DİKİŞ (SUM N7:N10)
    L15 = SUM(L13:L14)                # TOPLAM
    L18 = L15+L16+L17                 # BİRİM MALİYET (klişe + bıçak ekli)
    L21 = (L18*L19)+L18               # GENEL TOPLAM
"""
from decimal import Decimal

from sqlalchemy.orm import Session

from ._common import D, birim_fiyat_genel


def calc_koli(spec: dict, db: Session):
    from .registry import PricingResult

    fiyat = birim_fiyat_genel(db)

    EN  = D(spec.get("levha_en", 0))
    BOY = D(spec.get("levha_boy", 0))
    SAFYA_M2_FIYAT = D(spec.get("safya_m2_fiyat", 0))

    DIKIS_ADET = D(spec.get("dikis_adedi", 0))
    DIKIS_BIRIM_TL = D(spec.get("dikis_birim_tl", fiyat.koli_dikis_birim_tl))

    KLISE_GIDER_PER_AD = D(spec.get("birim_klise_gideri", 0))
    BICAK_GIDER_PER_AD = D(spec.get("birim_bicak_gideri", 0))
    KAR_ORANI = D(spec.get("kar_orani", "0.20"))

    SIPARIS_MIK = D(spec.get("siparis_miktari", 1)) or Decimal("1")

    levha = (EN * BOY * SAFYA_M2_FIYAT) / Decimal("1000000")
    dikis = DIKIS_BIRIM_TL * DIKIS_ADET
    toplam_birim = levha + dikis

    birim_maliyet = toplam_birim + KLISE_GIDER_PER_AD + BICAK_GIDER_PER_AD
    birim_satis = birim_maliyet * (Decimal("1") + KAR_ORANI)
    toplam_satis = birim_satis * SIPARIS_MIK

    return PricingResult(
        birim_maliyet=birim_maliyet,
        birim_satis=birim_satis,
        toplam_satis=toplam_satis,
        detay={
            "levha_tl": float(levha),
            "dikis_tl": float(dikis),
            "klise_gideri": float(KLISE_GIDER_PER_AD),
            "bicak_gideri": float(BICAK_GIDER_PER_AD),
            "kar_orani": float(KAR_ORANI),
            "siparis_miktari": float(SIPARIS_MIK),
        },
    )
