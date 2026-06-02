"""KUTU OFSET fiyat hesabı — KUTU 1 sayfasındaki OFSET KUTU HESAPLAMA bloğundan birebir.

Excel referans formülleri:
    L13 = (L4*M4*L6*L7) / 1_000_000_000           # KARTON
    L14 = (L4*M4*N6) / 1_000_000                  # ONDÜLE
    L15 = ((P6*P7) + (P8*P9)*P7 + P10) / P11      # BASKI
    L16 = (L4*M4*R11) / 1_000_000                 # LAK
    L17 = (L4*M4*T11) / 1_000_000                 # SIVAMA
    L18 = U11                                      # KESİM
    L19 = V11*L21                                  # YAPIŞTIRMA
    L20 = SUM(L13:L19)                             # ALT TOPLAM
    L25 = (L20/L21) + ((L23+L24)/L22)              # BİRİM MALİYET
    L28 = (L25*L26) + L25                          # BİRİM SATIŞ
"""
from decimal import Decimal

from sqlalchemy.orm import Session

from ._common import D, birim_fiyat_genel, gecis_carpan, ofset_baski_tl


def calc_kutu_ofset(spec: dict, db: Session):
    from .registry import PricingResult

    fiyat = birim_fiyat_genel(db)

    # ── Girdiler (mm/mm) ──
    EN  = D(spec.get("tabaka_en", 0))
    BOY = D(spec.get("tabaka_boy", 0))
    GRAMAJ = int(spec.get("gramaj", 0))
    KARTON_M2 = D(spec.get("karton_m2_fiyat", 0))
    ONDULE_M2 = D(spec.get("ondule_m2_fiyat", 0))

    KALIP_TL    = D(spec.get("baski_kalip_tl", 0))
    RENK_SAY    = int(spec.get("renk_sayisi", 0))
    GECIS_SAY   = int(spec.get("gecis_sayisi", 0))
    BOYA_TL     = D(spec.get("boya_tl", 0))
    BASKI_ADET  = D(spec.get("baski_adedi", 1)) or Decimal("1")

    KUTU_ADET_PER_TAB = D(spec.get("kutu_adedi_per_tabaka", 1)) or Decimal("1")
    TABAKA_ADET = D(spec.get("tabaka_adedi", 0))
    SIPARIS_MIK = D(spec.get("siparis_miktari", 0))

    # Bitiş işlemleri (TL/m²) — opsiyonel
    LAK_TL_M2    = D(spec.get("lak_tl_m2", fiyat.lak_tl_m2 if spec.get("lak_aktif") else 0))
    SIVAMA_TL_M2 = D(spec.get("sivama_tl_m2", fiyat.sivama_tl_m2 if spec.get("sivama_aktif") else 0))
    KESIM_TL     = D(spec.get("kesim_tl", fiyat.kesim_tl))
    YAPISTIRMA_TL_AD = D(spec.get("yapistirma_tl_ad", fiyat.yapistirma_tl_ad))

    KALIP_GIDER = D(spec.get("kalip_gideri", 0))
    DIGER_GIDER = D(spec.get("diger_gider", 0))
    KAR_ORANI   = D(spec.get("kar_orani", "0.20"))

    # ── Formüller ──
    karton = (EN * BOY * Decimal(GRAMAJ) * KARTON_M2) / Decimal("1000000000")
    ondule = (EN * BOY * ONDULE_M2) / Decimal("1000000")

    # Geçiş çarpanı: gramaja değil renk sayısına bağlı (HESAPLAMA VERİ DOSYASI'na göre)
    GECIS_DELTA = D(spec.get("gecis_delta", 0))
    GECIS_CARPAN_VAL = gecis_carpan(db, RENK_SAY)
    baski = (
        (KALIP_TL * RENK_SAY) + (GECIS_DELTA * GECIS_CARPAN_VAL) * RENK_SAY + BOYA_TL
    ) / BASKI_ADET

    lak    = (EN * BOY * LAK_TL_M2) / Decimal("1000000")
    sivama = (EN * BOY * SIVAMA_TL_M2) / Decimal("1000000")
    kesim  = KESIM_TL
    yapis  = YAPISTIRMA_TL_AD * KUTU_ADET_PER_TAB

    alt_toplam = karton + ondule + baski + lak + sivama + kesim + yapis

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
            "karton_tl": float(karton),
            "ondule_tl": float(ondule),
            "baski_tl": float(baski),
            "lak_tl": float(lak),
            "sivama_tl": float(sivama),
            "kesim_tl": float(kesim),
            "yapistirma_tl": float(yapis),
            "alt_toplam": float(alt_toplam),
            "montaj_kutu_adet": float(montaj_kutu_adet),
            "kalip_gideri": float(KALIP_GIDER),
            "diger_gider": float(DIGER_GIDER),
            "kar_orani": float(KAR_ORANI),
        },
    )
