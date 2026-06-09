"""KOLİ fiyat hesabı — KOLİ 1 HESAPLAMA bloğundan birebir.

Excel referans formülleri:
    L13 = (L5*M5*L7)/1_000_000   # LEVHA
    L14 = N11                     # DİKİŞ (= dikis_fiyati × adet veya tek toplam)
    L15 = SUM(L13:L14)
    L18 = L15 + L16 + L17        # BİRİM MALİYET (klişe + bıçak ekli)
    L21 = (L18*L19) + L18         # GENEL TOPLAM (= birim satış, 1 koli için)

Kritik gereği "dikis_adedi" yerine "dikis_fiyati" girişi kabul edilir.
"""
from decimal import Decimal

from sqlalchemy.orm import Session

from ._common import D


def calc_koli(spec: dict, db: Session):
    from .registry import PricingResult

    EN  = D(spec.get("levha_en", 0))
    BOY = D(spec.get("levha_boy", 0))
    SAFYA_M2_FIYAT = D(spec.get("safya_m2_fiyat", 0))

    # KRİTİK: dikis_adedi → dikis_fiyati (tek toplam fiyat) olarak değişti.
    # Geriye uyumluluk: eski dikis_adedi × dikis_birim_tl de kabul.
    if "dikis_fiyati" in spec and spec["dikis_fiyati"] not in (None, ""):
        dikis = D(spec["dikis_fiyati"])
    else:
        DIKIS_AD = D(spec.get("dikis_adedi", 0))
        DIKIS_BIRIM = D(spec.get("dikis_birim_tl", 0))
        dikis = DIKIS_AD * DIKIS_BIRIM

    # Klişe & bıçak: TOPLAM (birimsiz) gider — sipariş adedine bölünür.
    # (Eski kayıtlar 'birim_*' anahtarını kullanır → geriye dönük okunur.)
    KLISE = D(spec.get("klise_gideri", spec.get("birim_klise_gideri", 0)))
    BICAK = D(spec.get("bicak_gideri", spec.get("birim_bicak_gideri", 0)))
    KAR_ORANI = D(spec.get("kar_orani", "0.20"))

    SIPARIS_MIK = D(spec.get("siparis_miktari", 1)) or Decimal("1")

    levha = (EN * BOY * SAFYA_M2_FIYAT) / Decimal("1000000")
    toplam_birim = levha + dikis

    # İlave işlemler — KOLİ'de m² yerine doğrudan koli başına eklenen toplam.
    # Kullanıcı her işlem için TL girer (koli başına).
    ilave = Decimal("0")
    ilave_dict = spec.get("ilave_islemler") or {}
    if isinstance(ilave_dict, dict):
        ilave = sum(D(v) for v in ilave_dict.values() if v not in (None, ""))

    # Klişe + bıçak toplam gideri ürün başına dağıtılır
    klise_bicak_birim = (KLISE + BICAK) / SIPARIS_MIK
    birim_maliyet = toplam_birim + klise_bicak_birim + ilave
    birim_satis = birim_maliyet * (Decimal("1") + KAR_ORANI)
    toplam_satis = birim_satis * SIPARIS_MIK

    return PricingResult(
        birim_maliyet=birim_maliyet,
        birim_satis=birim_satis,
        toplam_satis=toplam_satis,
        detay={
            "levha_tl": float(levha),
            "dikis_tl": float(dikis),
            "ilave_islemler_tl": float(ilave),
            # Maliyet kırılımı PER-ÜRÜN gösterir: toplam gider / sipariş adedi
            "birim_klise_gideri": float(KLISE / SIPARIS_MIK),
            "birim_bicak_gideri": float(BICAK / SIPARIS_MIK),
            "kar_orani": float(KAR_ORANI),
            "siparis_miktari": float(SIPARIS_MIK),
        },
    )
