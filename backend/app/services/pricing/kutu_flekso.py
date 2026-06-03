"""KUTU FLEKSO fiyat hesabı — KUTU 1 FLEKSO HESAPLAMA bloğundan birebir.

Excel referans formülleri:
    P25 = (P17*Q17*P19)/1_000_000       # LEVHA
    P26 = R23                            # BASKI (kullanıcı manuel girer)
    P27 = S23                            # KESİM
    P28 = T23*P30                        # YAPIŞTIRMA (T23 birim, P30 açınım)
    P29 = SUM(P25:P28)                   # ALT TOPLAM
    P34 = (P29/P30) + ((P32+P33)/P31)    # BİRİM MALİYET
    P37 = P34 * (1 + P35)                # BİRİM SATIŞ

Önemli: Kesim ve yapıştırma için DB'den otomatik default ÇEKMEZ.
Kullanıcı seçmediyse 0 — Excel davranışıyla aynı.
"""
from decimal import Decimal

from sqlalchemy.orm import Session

from ._common import D


def calc_kutu_flekso(spec: dict, db: Session):
    from .registry import PricingResult

    EN  = D(spec.get("levha_en", 0))
    BOY = D(spec.get("levha_boy", 0))
    SAFYA_M2_FIYAT = D(spec.get("safya_m2_fiyat", 0))

    ACINIM = D(spec.get("acinim", spec.get("kutu_adedi_per_tabaka", 1))) or Decimal("1")
    SIPARIS_MIK = D(spec.get("siparis_miktari", 0))

    # Tabaka adedi otomatik (sipariş / açınım) ya da kullanıcı manuel
    if spec.get("tabaka_adedi"):
        TABAKA_ADET = D(spec["tabaka_adedi"])
    elif SIPARIS_MIK > 0 and ACINIM > 0:
        TABAKA_ADET = SIPARIS_MIK / ACINIM
    else:
        TABAKA_ADET = Decimal("0")

    # Kullanıcı manuel girer, varsayılan 0 (Excel davranışı)
    BASKI_TL  = D(spec.get("baski_kesim_tl", 0))
    KESIM_TL  = D(spec.get("kesim_tl", 0))
    YAP_TL_AD = D(spec.get("yapistirma_tl_ad", 0))

    KALIP_GIDER = D(spec.get("kalip_gideri", 0))
    DIGER_GIDER = D(spec.get("diger_gider", 0))
    KAR_ORANI   = D(spec.get("kar_orani", "0.20"))

    levha = (EN * BOY * SAFYA_M2_FIYAT) / Decimal("1000000")
    baski = BASKI_TL
    kesim = KESIM_TL
    yapis = YAP_TL_AD * ACINIM

    alt_toplam = levha + baski + kesim + yapis

    montaj_kutu_adet = TABAKA_ADET * ACINIM
    if montaj_kutu_adet == 0:
        montaj_kutu_adet = SIPARIS_MIK or Decimal("1")

    birim_maliyet = (alt_toplam / ACINIM) if ACINIM > 0 else Decimal("0")
    if montaj_kutu_adet > 0:
        birim_maliyet += (KALIP_GIDER + DIGER_GIDER) / montaj_kutu_adet
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
            "tabaka_adet": float(TABAKA_ADET),
            "acinim": float(ACINIM),
            "montaj_kutu_adet": float(montaj_kutu_adet),
            "kalip_gideri": float(KALIP_GIDER),
            "diger_gider": float(DIGER_GIDER),
            "kar_orani": float(KAR_ORANI),
        },
    )
