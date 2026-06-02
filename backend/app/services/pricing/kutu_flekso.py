"""KUTU FLEKSO fiyat hesabı — KUTU 1 sayfasındaki FLEKSO KUTU HESAPLAMA bloğundan birebir.

Excel referans formülleri:
    P25 = (P17*Q17*P19)/1_000_000          # LEVHA
    P26 = R23                              # BASKI (toplam, lookup'lardan)
    P27 = S23                              # KESİM
    P28 = T23*P30                          # YAPIŞTIRMA
    P29 = SUM(P25:P28)                     # ALT TOPLAM
    P34 = (P29/P30) + ((P32+P33)/P31)      # BİRİM MALİYET
    P37 = (P34*P35) + P34                  # BİRİM SATIŞ
"""
from decimal import Decimal

from sqlalchemy.orm import Session

from ._common import D, birim_fiyat_genel


def calc_kutu_flekso(spec: dict, db: Session):
    from .registry import PricingResult

    fiyat = birim_fiyat_genel(db)

    EN  = D(spec.get("levha_en", 0))
    BOY = D(spec.get("levha_boy", 0))
    SAFYA_M2_FIYAT = D(spec.get("safya_m2_fiyat", 0))

    KUTU_ADET_PER_TAB = D(spec.get("kutu_adedi_per_tabaka", 1)) or Decimal("1")
    SIPARIS_MIK = D(spec.get("siparis_miktari", 0))
    TABAKA_ADET = D(spec.get("tabaka_adedi", 0))

    BASKI_TL  = D(spec.get("baski_kesim_tl", fiyat.flekso_baski_kesim_tl))
    KESIM_TL  = D(spec.get("kesim_tl", fiyat.flekso_kesim_tl))
    YAP_TL_AD = D(spec.get("yapistirma_tl_ad", fiyat.flekso_yapistirma_tl_ad))

    KALIP_GIDER = D(spec.get("kalip_gideri", 0))
    DIGER_GIDER = D(spec.get("diger_gider", 0))
    KAR_ORANI   = D(spec.get("kar_orani", "0.20"))

    levha = (EN * BOY * SAFYA_M2_FIYAT) / Decimal("1000000")
    baski = BASKI_TL
    kesim = KESIM_TL
    yapis = YAP_TL_AD * KUTU_ADET_PER_TAB

    alt_toplam = levha + baski + kesim + yapis

    montaj_kutu_adet = TABAKA_ADET * KUTU_ADET_PER_TAB
    if montaj_kutu_adet == 0:
        montaj_kutu_adet = SIPARIS_MIK or Decimal("1")

    birim_maliyet = (
        (alt_toplam / KUTU_ADET_PER_TAB)
        + ((KALIP_GIDER + DIGER_GIDER) / montaj_kutu_adet)
    )
    birim_satis = birim_maliyet * (Decimal("1") + KAR_ORANI)
    toplam_satis = birim_satis * montaj_kutu_adet

    return PricingResult(
        birim_maliyet=birim_maliyet,
        birim_satis=birim_satis,
        toplam_satis=toplam_satis,
        detay={
            "levha_tl": float(levha),
            "baski_tl": float(baski),
            "kesim_tl": float(kesim),
            "yapistirma_tl": float(yapis),
            "alt_toplam": float(alt_toplam),
            "montaj_kutu_adet": float(montaj_kutu_adet),
            "kalip_gideri": float(KALIP_GIDER),
            "diger_gider": float(DIGER_GIDER),
            "kar_orani": float(KAR_ORANI),
        },
    )
