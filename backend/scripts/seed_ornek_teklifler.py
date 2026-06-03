"""Örnek teklifler — Doc/ klasöründeki 3 Excel hesaplamasının birebir karşılığı.

Her örnek, hesaplama motorundan (services.pricing) geçirilir; böylece sistemin
ürettiği değer ile Excel referansı yan yana doğrulanır. Render başlangıcında
start.sh tarafından çağrılır. Idempotent — teklif_no varsa atlar.

Excel referansları:
  OFSET  (OFSET HESAPLAMA (1).xlsx)  → birim maliyet 11,164 / birim satış 15,0716
  FLEKSO (FLEKSO HESAPLAMA.xlsx)     → birim maliyet  6,9232 / birim satış  9,3463
  KOLİ   (KOLİ HESAPLAMA.xlsx)       → birim maliyet 28,3186 / birim satış 38,2301
"""
import sys
from datetime import date
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.db.session import SessionLocal
from app.db.models import Firma, Kullanici, Teklif, TeklifKalem
from app.services.pricing import calculate


# ── Örnek tanımları: (teklif_no, firma_adı, ürün, kalem_tipi, spec, excel_maliyet, excel_satis) ──
ORNEKLER = [
    {
        "teklif_no": "ORN-OFSET-001",
        "firma": "KÖSE AYAKKABI",
        "urun": "WEAL MERDANE SPOR KUTU",
        "kalem_tipi": "KUTU_OFSET",
        "spec": {
            "bicak_no": "16500",
            "tabaka_en": 750, "tabaka_boy": 1057,
            "acinim": 2, "tabaka_adedi": 5000, "siparis_miktari": 10000,
            "karton_cinsi": "KROMA", "gramaj": 230, "karton_m2_fiyat": 43.5,
            "oluklu_cinsi": "B120/S080/ - E", "oluklu_m2_fiyat": 10,
            "baski_turu": "ROLAND_800", "renk_sayisi": 2,
            "baski_kalip_tl": 2000, "boya_tl": 3600, "gecis_carpan": 0.55,
            "kesim_tl": 2.25, "yapistirma_tl_ad": 0,
            "ilave_islemler": {"SIVAMA": 2.85},
            "kar_orani": 0.35,
        },
        "excel_maliyet": "11.164", "excel_satis": "15.0716",
    },
    {
        "teklif_no": "ORN-FLEKSO-001",
        "firma": "ATLASPORT",
        "urun": "COMFORT GARSON SPOR KUTU",
        "kalem_tipi": "KUTU_FLEKSO",
        "spec": {
            "bicak_no": "16500",
            "levha_en": 750, "levha_boy": 1057,
            "acinim": 2, "tabaka_adedi": 3000, "siparis_miktari": 6000,
            "oluklu_kalite": "T090/S080/T090 - E", "safya_m2_fiyat": 12,
            "renk_sayisi": 2, "baski_kesim_tl": 4, "kesim_tl": 0, "yapistirma_tl_ad": 0,
            "eklenti": "KILITLI",
            "kalip_gideri": 1000, "diger_gider": 0, "kar_orani": 0.35,
        },
        "excel_maliyet": "6.9232", "excel_satis": "9.3463",
    },
    {
        "teklif_no": "ORN-KOLI-001",
        "firma": "KÖSE AYAKKABI",
        "urun": "WEAL MERDANE SPOR KOLİ 10'LU",
        "kalem_tipi": "KOLI",
        "spec": {
            "koli_boy": 610, "koli_en": 445, "koli_yukseklik": 350,
            "siparis_miktari": 710,
            "oluklu_kalite": "T090/S080/S080/S080/T090 - BC",
            "levha_en": 802, "levha_boy": 2140, "safya_m2_fiyat": 16.5,
            "baski_durum": "BASKILI", "renk_sayisi": 1, "eklenti": "YAPISTIRMA",
            "dikis_fiyati": 0, "ilave_islemler": {},
            "birim_klise_gideri": 0, "birim_bicak_gideri": 0, "kar_orani": 0.35,
        },
        "excel_maliyet": "28.3186", "excel_satis": "38.2301",
    },
]


def q2(d: Decimal) -> Decimal:
    return Decimal(d).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def q4(d: Decimal) -> Decimal:
    return Decimal(d).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)


def main():
    db = SessionLocal()
    try:
        admin = db.query(Kullanici).filter(Kullanici.kullanici_adi == "admin").first()
        if not admin:
            print("  ⚠ admin kullanıcısı yok — örnek teklifler atlandı.")
            return

        print("\n  ── Örnek Teklif Doğrulaması (Excel ↔ Sistem) ──")
        eklenen = 0
        # Her örnek KENDİ try'ında ve KENDİ commit'inde — biri patlasa diğerleri etkilenmez
        # (seed_demo_data.py / ABC ile aynı dayanıklı mantık).
        for orn in ORNEKLER:
            try:
                # Idempotent — varsa atla
                if db.query(Teklif).filter(Teklif.teklif_no == orn["teklif_no"]).first():
                    print(f"  ℹ {orn['teklif_no']} zaten var")
                    continue

                # Firma (Excel'deki firma adlarıyla)
                firma = db.query(Firma).filter(Firma.ad == orn["firma"]).first()
                if not firma:
                    firma = Firma(ad=orn["firma"], notlar="Örnek teklif firması (Doc/ referansı).")
                    db.add(firma)
                    db.flush()

                # Hesaplama motoru — sistemin ürettiği değer
                sonuc = calculate(orn["kalem_tipi"], orn["spec"], db)
                birim_satis = q4(sonuc.birim_satis)
                adet = int(Decimal(str(orn["spec"]["siparis_miktari"])))
                kalem_toplam = q2(birim_satis * adet)

                # Excel ↔ Sistem karşılaştırma çıktısı
                em, es = Decimal(orn["excel_maliyet"]), Decimal(orn["excel_satis"])
                sm, ss = q4(sonuc.birim_maliyet), birim_satis
                ok = abs(sm - em) < Decimal("0.01") and abs(ss - es) < Decimal("0.01")
                print(f"  {'✅' if ok else '❌'} {orn['teklif_no']:16} maliyet: Excel {em} / Sistem {sm}   "
                      f"satış: Excel {es} / Sistem {ss}")

                ara = kalem_toplam
                kdv = q2(ara * Decimal("0.20"))
                teklif = Teklif(
                    teklif_no=orn["teklif_no"],
                    firma_id=firma.id,
                    olusturan_id=admin.id,
                    atanan_id=admin.id,
                    yetkili=orn["firma"],
                    tarih=date.today(),
                    vade_metni="30 gün",
                    kdv_orani=Decimal("0.200"),
                    ara_toplam=ara, kdv_tutari=kdv, genel_toplam=q2(ara + kdv),
                    durum="TEKLIF_VERILDI",
                    notlar="Doc/ Excel referansının birebir karşılığı — otomatik örnek.",
                )
                db.add(teklif)
                db.flush()
                db.add(TeklifKalem(
                    teklif_id=teklif.id, sira_no=1,
                    kalem_tipi=orn["kalem_tipi"], urun_ismi=orn["urun"],
                    adet=adet, birim_fiyat=birim_satis, toplam=kalem_toplam,
                    spesifikasyon=orn["spec"], hesap_detayi=sonuc.detay,
                    notlar="Excel ile birebir doğrulanmış örnek kalem.",
                ))
                db.commit()  # her örnek tek tek commit
                eklenen += 1
            except Exception as e:
                db.rollback()
                print(f"  ⚠ {orn['teklif_no']} eklenemedi: {e}")

        print(f"  ✅ Örnek teklif seed bitti ({eklenen} yeni teklif)\n")
    finally:
        db.close()


if __name__ == "__main__":
    main()
