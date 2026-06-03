"""KUTU OFSET fiyat hesabı — KUTU 1 sayfasındaki OFSET KUTU HESAPLAMA bloğundan birebir.

Excel referans formülleri:
    P8 = IF(P11>3000, P11-3000, 0)            ← ek geçiş adedi (otomatik)
    L13 = (L4*M4*L6*L7) / 1_000_000_000        # KARTON
    L14 = (L4*M4*N6) / 1_000_000               # OLUKLU (eski "ondüle")
    L15 = ((P6*P7) + (P8*P9)*P7 + P10) / P11   # BASKI (ek geçişle birlikte)
    L16 = (L4*M4*R11) / 1_000_000              # LAK
    L17 = (L4*M4*T11) / 1_000_000              # SIVAMA
    L18 = U11                                   # KESİM
    L19 = V11*L21                               # YAPIŞTIRMA
    L20 = SUM(L13:L19)                          # ALT TOPLAM
    L25 = (L20/L21) + ((L23+L24)/L22)           # BİRİM MALİYET
    L28 = L25 * (1 + L26)                       # BİRİM SATIŞ

Önemli: Hiçbir kalem (lak, sıvama, kesim, yapıştırma, oluklu) için DB'den
otomatik default ÇEKMEZ. Kullanıcı seçmediyse 0 — Excel davranışıyla aynı.
"""
from decimal import Decimal

from sqlalchemy.orm import Session

from ._common import D, gecis_carpan


def calc_kutu_ofset(spec: dict, db: Session):
    from .registry import PricingResult

    # ── Girdiler (mm/mm) ──
    EN  = D(spec.get("tabaka_en", 0))
    BOY = D(spec.get("tabaka_boy", 0))
    GRAMAJ = int(spec.get("gramaj", 0))
    KARTON_M2 = D(spec.get("karton_m2_fiyat", 0))
    # "Oluklu" Excel'de N6, kritik gereği yeniden adlandırıldı (Ondüle → Oluklu Cinsi)
    OLUKLU_M2 = D(spec.get("oluklu_m2_fiyat", spec.get("ondule_m2_fiyat", 0)))

    KALIP_TL   = D(spec.get("baski_kalip_tl", 0))
    RENK_SAY   = int(spec.get("renk_sayisi", 0))
    BOYA_TL    = D(spec.get("boya_tl", 0))
    BASKI_ADET = D(spec.get("baski_adedi", spec.get("tabaka_adedi", 1))) or Decimal("1")

    # ── EK GEÇİŞ — Excel: P8 = IF(P11>3000, P11-3000, 0) ──
    GECIS_DELTA = max(Decimal("0"), BASKI_ADET - Decimal("3000"))

    # Geçiş çarpanı — kullanıcı override edebilir, etmezse tablodan
    if "gecis_carpan" in spec and spec["gecis_carpan"] not in (None, ""):
        GECIS_CARPAN_VAL = D(spec["gecis_carpan"])
    else:
        GECIS_CARPAN_VAL = gecis_carpan(db, RENK_SAY)

    # AÇINIM (eski "kutu_adedi_per_tabaka" — tabakadan çıkan kutu sayısı)
    ACINIM = D(spec.get("acinim", spec.get("kutu_adedi_per_tabaka", 1))) or Decimal("1")

    # Tabaka adedi = sipariş_miktarı / açınım (yoksa kullanıcı manuel)
    if spec.get("tabaka_adedi"):
        TABAKA_ADET = D(spec["tabaka_adedi"])
    elif spec.get("siparis_miktari") and ACINIM > 0:
        TABAKA_ADET = D(spec["siparis_miktari"]) / ACINIM
    else:
        TABAKA_ADET = Decimal("0")

    SIPARIS_MIK = D(spec.get("siparis_miktari", TABAKA_ADET * ACINIM))

    # Bitiş işlemleri — kullanıcı manuel girer, varsayılan 0 (Excel ile uyumlu)
    LAK_TL_M2        = D(spec.get("lak_tl_m2", 0))
    SIVAMA_TL_M2     = D(spec.get("sivama_tl_m2", 0))
    KESIM_TL         = D(spec.get("kesim_tl", 0))
    YAPISTIRMA_TL_AD = D(spec.get("yapistirma_tl_ad", 0))

    KALIP_GIDER = D(spec.get("kalip_gideri", 0))
    DIGER_GIDER = D(spec.get("diger_gider", 0))
    KAR_ORANI   = D(spec.get("kar_orani", "0.20"))

    # ── Formüller (Excel L13–L19) ──
    karton = (EN * BOY * Decimal(GRAMAJ) * KARTON_M2) / Decimal("1000000000")
    oluklu = (EN * BOY * OLUKLU_M2) / Decimal("1000000")
    baski  = (
        (KALIP_TL * RENK_SAY)
        + (GECIS_DELTA * GECIS_CARPAN_VAL) * RENK_SAY
        + BOYA_TL
    ) / BASKI_ADET if BASKI_ADET > 0 else Decimal("0")
    lak    = (EN * BOY * LAK_TL_M2) / Decimal("1000000")
    sivama = (EN * BOY * SIVAMA_TL_M2) / Decimal("1000000")
    kesim  = KESIM_TL
    yapis  = YAPISTIRMA_TL_AD * ACINIM

    # İlave işlemler — {kod: tl_m2} formatında. Hepsinin toplam TL/m²
    # tabaka boyutuyla çarpılıp tabaka maliyetine eklenir (Excel R11 mantığı).
    ilave = Decimal("0")
    ilave_dict = spec.get("ilave_islemler") or {}
    if isinstance(ilave_dict, dict):
        toplam_m2 = sum(D(v) for v in ilave_dict.values() if v not in (None, ""))
        ilave = (EN * BOY * toplam_m2) / Decimal("1000000")

    alt_toplam = karton + oluklu + baski + lak + sivama + kesim + yapis + ilave

    # Excel: L22 = P11*L21 (= BASKI_ADET × ACINIM, ki BASKI_ADET = TABAKA_ADET)
    montaj_kutu_adet = TABAKA_ADET * ACINIM
    if montaj_kutu_adet == 0:
        montaj_kutu_adet = SIPARIS_MIK or Decimal("1")

    # Birim maliyet (L25)
    birim_maliyet = (alt_toplam / ACINIM) if ACINIM > 0 else Decimal("0")
    if montaj_kutu_adet > 0:
        birim_maliyet += (KALIP_GIDER + DIGER_GIDER) / montaj_kutu_adet

    # Birim satış (L28) ve toplam
    birim_satis = birim_maliyet * (Decimal("1") + KAR_ORANI)
    toplam_satis = birim_satis * montaj_kutu_adet

    return PricingResult(
        birim_maliyet=birim_maliyet,
        birim_satis=birim_satis,
        toplam_satis=toplam_satis,
        detay={
            "karton_tl": float(karton),
            "oluklu_tl": float(oluklu),
            # Geriye uyumluluk için eski "ondule_tl" anahtarı da bulunuyor
            "ondule_tl": float(oluklu),
            "baski_tl": float(baski),
            "lak_tl": float(lak),
            "sivama_tl": float(sivama),
            "kesim_tl": float(kesim),
            "yapistirma_tl": float(yapis),
            "ilave_islemler_tl": float(ilave),
            "alt_toplam": float(alt_toplam),
            "tabaka_adet": float(TABAKA_ADET),
            "acinim": float(ACINIM),
            "montaj_kutu_adet": float(montaj_kutu_adet),
            "ek_gecis_adedi": float(GECIS_DELTA),
            "gecis_carpan_kullanilan": float(GECIS_CARPAN_VAL),
            "kalip_gideri": float(KALIP_GIDER),
            "diger_gider": float(DIGER_GIDER),
            "kar_orani": float(KAR_ORANI),
        },
    )
