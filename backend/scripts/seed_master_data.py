"""Master tablolar — Excel veri sözlüğünden alınmış değerlerle seed eder.

Kaynak:
    SİPARİŞ VERİ DOSYASI         → karton_cinsi, gramaj, baski_turu, renk, baski_sonrasi, eklenti, ambalaj_sekli, grafik_durumu
    KOLİ SİPARİŞ ... VERİ DOS    → oluklu_kalite
    HESAPLAMA VERİ DOSYASI       → birim_fiyat_ofset, gecis_carpan, birim_fiyat_genel
"""
import sys
from decimal import Decimal
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.db.models import (
    AmbalajSekli, BaskiSonrasi, BaskiTuru, BirimFiyatGenel, BirimFiyatOfset,
    Eklenti, GecisCarpan, GrafikDurumu, Gramaj, KalemTipi, KartonCinsi,
    OlukluKalite, Renk,
)
from app.db.session import SessionLocal


# ── KAYNAK VERİ ─────────────────────────────────────────────────────────────

KARTON_CINSI = [
    ("KROMA", "Kroma"),
    ("KUSESIZ_KROMA", "Kuşesiz Kroma"),
    ("BRISTOL", "Bristol"),
    ("BT_LINER", "BT Liner"),
    ("KRAFT", "Kraft"),
]

GRAMAJLAR = [160, 180, 200, 210, 230, 250, 300, 350, 400, 450]

# OFSET 'baski_turu' lookup'ının TEK tüketicisidir → yalnız ofset makineleri.
# (FLEKSO kendi 'baski_durum', KOLİ 'baskili_baskisiz' kullanır; Baskısız OFSET'te istenmiyor.)
BASKI_TURU = [
    ("ROLAND_700", "Roland 700 (Ofset)"),
    ("ROLAND_800", "Roland 800 (Ofset)"),
]

RENKLER = [
    ("BASKISIZ", "Baskısız", None),
    ("CMYK", "CMYK", None),
    # CMYK proses renkleri — "renk_multi" CMYK otomatik doldurma bunları seçer (kritik #3)
    ("CYAN", "Cyan", "#00AEEF"),
    ("MAGENTA", "Magenta", "#EC008C"),
    ("SIYAH", "Siyah", "#111111"),
    ("KIRMIZI", "Kırmızı", "#D32F2F"),
    ("MAVI", "Mavi", "#1976D2"),
    ("ACIK_MAVI", "Açık Mavi", "#64B5F6"),
    ("TURKUAZ", "Turkuaz", "#00ACC1"),
    ("LACIVERT", "Lacivert", "#1A237E"),
    ("TURUNCU", "Turuncu", "#F57C00"),
    ("YESIL", "Yeşil", "#388E3C"),
    ("ACIK_YESIL", "Açık Yeşil", "#81C784"),
    ("KOYU_YESIL", "Koyu Yeşil", "#1B5E20"),
    ("BEYAZ", "Beyaz", "#FFFFFF"),
    ("SARI", "Sarı", "#FBC02D"),
    ("PEMBE", "Pembe", "#EC407A"),
    ("MOR", "Mor", "#7B1FA2"),
    ("GRI", "Gri", "#757575"),
    ("FUME", "Füme", "#37474F"),
    ("ANTRASIT", "Antrasit", "#263238"),
    ("KAHVERENGI", "Kahverengi", "#5D4037"),
    ("BORDO", "Bordo", "#880E4F"),
]

BASKI_SONRASI = [
    ("YOK", "Yok"),
    ("LAK", "Lak"),
    ("SIVAMA", "Sıvama"),
    ("DISPERSIYON_LAK", "Dispersiyon Lak"),
    ("UV_LAK", "UV Lak"),
    ("PARLAK_SELEFON", "Parlak Selefon"),
    ("MAT_SELEFON", "Mat Selefon"),
    ("HIGHLOSS", "Highloss"),
    ("KISMI_LAK", "Kısmi Lak"),
    ("TERMO_LAK", "Termo Lak"),
    ("GOFRE", "Gofre"),
    ("ASETAT", "Asetat"),
    ("SELEFON_PENCERE_KESIM", "Selefon + Pencere Kesim"),
    ("KUS_GOZU", "Kuş Gözü"),
]

EKLENTILER = [
    ("KILITLI", "Kilitli"),
    ("YAPISTIRMA", "Yapıştırma"),
    ("DIKIS", "Dikiş"),
    ("YOK", "Yok"),
]

AMBALAJ = [
    ("SHRINKSIZ_DOKME", "Shrinksiz Dökme"),
    ("SHRINKLI_DOKME", "Shrinkli Dökme"),
    ("SHRINKSIZ_PALETLI", "Shrinksiz Paletli"),
    ("SHRINKLI_PALETLI", "Shrinkli Paletli"),
    ("PALETLI", "Paletli"),
    ("DOKME", "Dökme"),
]

GRAFIK = [
    ("KALIP_VAR", "Kalıp Var"),
    ("YENI_CALISMA", "Yeni Çalışma"),
    ("ESKI_CALISMA", "Eski Çalışma"),
    ("ESKI_CALISMA_MONTAJ_DEGISIKLIGI", "Eski Çalışma Montaj Değişikliği"),
    ("PDF_VAR", "PDF Var"),
    ("KLISESI_VAR", "Klişesi Var"),
    ("TASARIM_TEMSILCIYLE", "Tasarım Temsilciyle Yapılacak"),
    ("TASARIM_MUSTERIYLE", "Tasarım Müşteriyle Yapılacak"),
]

# Oluklu kaliteler — KOLİ SİPARİŞ OLUŞTURMA VERİ DOS sayfasındaki birleşik kod sütunundan
OLUKLU_KALITELER = [
    # (kod, tip)
    ("B120/S080/T090 - B", "B"), ("B120/S135/MK135 - B", "B"), ("B120/S135/T090 - B", "B"),
    ("MK110/S080/T090 - B", "B"), ("MK110/S135/MK110 - B", "B"), ("MK135/S135/MK135 - B", "B"),
    ("T090/S080/T090 - B", "B"),
    ("B120/S135/T090 - C", "C"), ("B125/S080/T090 - C", "C"), ("KR100/S135/MK110 - C", "C"),
    ("KR135/S135/MK135 - C", "C"), ("MK110/S080/T090 - C", "C"), ("MK110/S120/MK110 - C", "C"),
    ("MK110/S135/MK110 - C", "C"), ("MK110/S175/MK110 - C", "C"), ("MK135/S135/MK135 - C", "C"),
    ("MK135/S175/MK135 - C", "C"), ("T090/S080/T090 - C", "C"),
    ("B120/S080/ - E", "E"), ("B120/S080/T090 - E", "E"), ("B125/S120/ - E", "E"),
    ("MK110/S080/T090 - E", "E"), ("MK110/S120/MK110 - E", "E"), ("MK110/S125/T090 - E", "E"),
    ("MK135/S135/MK135 - E", "E"), ("T090/S080/ - E", "E"), ("T090/S080/T090 - E", "E"),
    ("T090/S120/ - E", "E"), ("T090/S135/ - E", "E"),
    ("B120/S080/S080/S080/MK110 - BC", "BC"), ("B120/S080/S080/S080/T090 - BC", "BC"),
    ("B120/S120/S080/S120/T090 - BC", "BC"), ("B120/S120/S080/S120/MK110 - BC", "BC"),
    ("B120/S135/S080/S135/MK110 - BC", "BC"), ("B120/S135/S120/S135/MK110 - BC", "BC"),
    ("KR100/S080/S080/S080/MK110 - BC", "BC"), ("KR100/S080/S080/S080/T090 - BC", "BC"),
    ("KR100/S120/S080/S120/T090 - BC", "BC"), ("KR100/S135/S080/S135/MK110 - BC", "BC"),
    ("KR135/S135/S080/S135/MK135 - BC", "BC"), ("KR135/S135/S120/S135/KR135 - BC", "BC"),
    ("KR135/S175/S135/S175/KR135 - BC", "BC"),
    ("MK110/S080/S080/S080/MK110 - BC", "BC"), ("MK110/S080/S080/S080/T090 - BC", "BC"),
    ("MK110/S125/S080/S125/MK110 - BC", "BC"), ("MK110/S125/S080/S125/T090 - BC", "BC"),
    ("MK110/S135/S080/S135/MK110 - BC", "BC"), ("MK110/S135/S080/S135/T090 - BC", "BC"),
    ("MK135/S135/S135/S135/MK135 - BC", "BC"), ("MK135/S140/S080/S140/MK135 - BC", "BC"),
    ("MK135/S175/S135/S175/MK135 - BC", "BC"),
    ("T090/S080/S080/S080/S080 - BC", "BC"), ("T090/S080/S080/S080/T090 - BC", "BC"),
    ("B120/S120/S080/S120/T090 - EB", "EB"), ("B120/S135/S080/S135/MK110 - EB", "EB"),
    ("B125/S080/S080/S080/T090 - EB", "EB"), ("KR135/S120/S080/S120/MK135 - EB", "EB"),
    ("MK110/S080/S080/S080/MK110 - EB", "EB"), ("MK110/S080/S080/S080/T090 - EB", "EB"),
    ("MK110/S120/S080/S120/T090 - EB", "EB"), ("MK110/S135/S080/S135/T090 - EB", "EB"),
    ("MK135/S135/S080/S135/MK135 - EB", "EB"), ("T090/S080/S080/S080/T090 - EB", "EB"),
]

# OFSET baskı TL (HESAPLAMA VERİ DOSYASI gramaj × baskı sütunu)
OFSET_BASKI = [
    (180, "1300"), (200, "1450"), (210, "2000"), (230, "2500"),
    (250, "2500"), (300, "2500"), (350, "2500"), (400, "2500"),
]

# Renk sayısı × geçiş çarpanı
GECIS_CARPANI = [
    (1, "0.000"), (2, "0.350"), (3, "0.400"), (4, "0.500"), (5, "0.550"), (6, "0.550"),
]


# ── KALEM TİPİ ŞEMALARI ──────────────────────────────────────────────────

KUTU_OFSET_SEMA = {
    "gruplar": [
        {
            "ad": "Ürün Bilgisi",
            "alanlar": [
                {"key": "bicak_no", "label": "Bıçak No", "tip": "text"},
                {"key": "tabaka_en", "label": "Tabaka EN (mm)", "tip": "number", "zorunlu": True},
                {"key": "tabaka_boy", "label": "Tabaka BOY (mm)", "tip": "number", "zorunlu": True},
                # Açınım EN/BOY iptal — yerine tek "AÇINIM" alanı (manuel rakam = tabakadan çıkan kutu sayısı)
                {"key": "acinim", "label": "Açınım (adet)", "tip": "number", "zorunlu": True,
                 "aciklama": "Bir tabakadan çıkan kutu sayısı"},
                {"key": "tabaka_adedi", "label": "Tabaka Adedi", "tip": "number", "zorunlu": True},
                # Sipariş miktarı otomatik: tabaka_adedi × açınım
                {"key": "siparis_miktari", "label": "Sipariş Miktarı", "tip": "auto",
                 "formul": "siparis_miktari", "aciklama": "Tabaka Adedi × Açınım"},
            ],
        },
        {
            "ad": "Malzeme",
            "alanlar": [
                {"key": "karton_cinsi", "label": "Karton Cinsi", "tip": "lookup", "kaynak": "karton_cinsi"},
                {"key": "gramaj", "label": "Gramaj", "tip": "lookup", "kaynak": "gramaj"},
                {"key": "karton_m2_fiyat", "label": "Karton TL/m²", "tip": "number"},
                # Ondüle TL/m² yerine "Oluklu Cinsi" + fiyat (kritik #2)
                {"key": "oluklu_cinsi", "label": "Oluklu Cinsi", "tip": "lookup", "kaynak": "oluklu_kalite"},
                {"key": "oluklu_m2_fiyat", "label": "Oluklu TL/m²", "tip": "number"},
            ],
        },
        {
            "ad": "Baskı",
            "alanlar": [
                {"key": "baski_turu", "label": "Baskı Türü", "tip": "lookup", "kaynak": "baski_turu"},
                {"key": "renk_sayisi", "label": "Renk Sayısı", "tip": "int", "min": 0, "max": 6},
                # Renk Seçimi — CMYK seçilirse 4 renk aynı anda (kritik #3)
                {"key": "renk_kodlari", "label": "Renk Seçimi", "tip": "renk_multi"},
                {"key": "baski_kalip_tl", "label": "Baskı Kalıp TL", "tip": "number",
                 "aciklama": "Kalıp gideri burada — Sevkiyat'ta tekrar yok"},
                {"key": "boya_tl", "label": "Boya TL", "tip": "number"},
                # Geçiş çarpanı: kullanıcı boş bırakırsa renk sayısına göre tablodan; manuel override edebilir
                {"key": "gecis_carpan", "label": "Geçiş Çarpanı", "tip": "number",
                 "aciklama": "Boş bırakılırsa renk sayısına göre otomatik (tablodan)"},
                # Baskı Adedi otomatik = tabaka adedi (Excel: P11=B12)
                {"key": "baski_adedi", "label": "Baskı Adedi", "tip": "auto",
                 "formul": "baski_adedi", "aciklama": "Tabaka Adedi ile aynı"},
                # Ek Geçiş Adedi otomatik (Excel: P8 = IF(P11>3000, P11-3000, 0))
                {"key": "ek_gecis_adedi", "label": "Ek Geçiş Adedi", "tip": "auto",
                 "formul": "ek_gecis", "aciklama": "3000 üstünde ek geçiş otomatik"},
            ],
        },
        {
            # Lak/Sıvama checkbox'ları iptal → İlave İşlemler içinde (kritik #5, #6, #7).
            # Kesim (Excel L18=U11, tabaka başına düz TL) ve Yapıştırma (L19=V11×açınım) buraya geri eklendi.
            "ad": "Kesim & İlave İşlemler",
            "alanlar": [
                {"key": "kesim_tl", "label": "Kesim TL (tabaka başına)", "tip": "number"},
                # Yapıştırma artık ayrı alan değil — İlave kutusunda "ekstra" satır (TL/adet, fiyatı
                # listeden otomatik gelir, elle değişir). Lak/Sıvama TL/m², Yapıştırma TL/adet.
                {"key": "ilave_islemler", "label": "Lak / Sıvama / Yapıştırma & Fiyatları",
                 "tip": "ilave_islemler", "birim": "TL/m²",
                 "ekstra": [{"kod": "YAPISTIRMA", "ad": "Yapıştırma", "birim": "TL/adet"}]},
                {"key": "eklenti", "label": "Eklenti", "tip": "lookup", "kaynak": "eklenti"},
            ],
        },
        {
            # Kalıp Gideri buradan kaldırıldı (kritik #9) — Baskı bölümünde
            "ad": "Sevkiyat & Diğer",
            "alanlar": [
                {"key": "ambalaj_sekli", "label": "Yükleme Şekli", "tip": "lookup", "kaynak": "ambalaj_sekli"},
                {"key": "grafik_durumu", "label": "Grafik", "tip": "lookup", "kaynak": "grafik_durumu"},
                {"key": "diger_gider", "label": "Diğer Gider", "tip": "number"},
                {"key": "kar_orani", "label": "Kâr Oranı", "tip": "percent", "varsayilan": 0.2},
            ],
        },
    ]
}

KUTU_FLEKSO_SEMA = {
    "gruplar": [
        {
            "ad": "Ürün Bilgisi",
            "alanlar": [
                {"key": "bicak_no", "label": "Bıçak No", "tip": "text"},
                {"key": "levha_en", "label": "Levha EN (mm)", "tip": "number", "zorunlu": True},
                {"key": "levha_boy", "label": "Levha BOY (mm)", "tip": "number", "zorunlu": True},
                {"key": "acinim", "label": "Açınım (adet)", "tip": "number", "zorunlu": True},
                {"key": "tabaka_adedi", "label": "Tabaka Adedi", "tip": "number", "zorunlu": True},
                {"key": "siparis_miktari", "label": "Sipariş Miktarı", "tip": "auto",
                 "formul": "siparis_miktari"},
            ],
        },
        {
            "ad": "Malzeme",
            "alanlar": [
                {"key": "oluklu_kalite", "label": "Oluklu Kalite", "tip": "lookup", "kaynak": "oluklu_kalite"},
                {"key": "safya_m2_fiyat", "label": "Safya TL/m²", "tip": "number"},
            ],
        },
        {
            "ad": "Baskı & İşlemler",
            "alanlar": [
                {"key": "renk_sayisi", "label": "Renk Sayısı", "tip": "int", "min": 0, "max": 6},
                {"key": "renk_kodlari", "label": "Renk Seçimi", "tip": "renk_multi"},
                # Seçmeli: işaretlenince fiyat listesinden otomatik gelir, manuel düzenlenebilir
                {"key": "baski_kesim_tl", "label": "Baskı+Kesim", "tip": "secmeli", "fiyat_kaynak": "flekso_baski_kesim_tl"},
                {"key": "kesim_tl", "label": "Kesim", "tip": "secmeli", "fiyat_kaynak": "flekso_kesim_tl"},
                {"key": "yapistirma_tl_ad", "label": "Yapıştırma/Dikiş", "tip": "secmeli", "fiyat_kaynak": "flekso_yapistirma_tl_ad"},
                {"key": "eklenti", "label": "Eklenti", "tip": "lookup", "kaynak": "eklenti"},
            ],
        },
        {
            "ad": "Sevkiyat & Diğer",
            "alanlar": [
                {"key": "ambalaj_sekli", "label": "Yükleme Şekli", "tip": "lookup", "kaynak": "ambalaj_sekli"},
                {"key": "grafik_durumu", "label": "Grafik", "tip": "lookup", "kaynak": "grafik_durumu"},
                # Kalıp Gideri FLEKSO'da kaldırıldı (kullanıcı talebi)
                {"key": "diger_gider", "label": "Diğer Gider", "tip": "number"},
                {"key": "kar_orani", "label": "Kâr Oranı", "tip": "percent", "varsayilan": 0.2},
            ],
        },
    ]
}

KOLI_SEMA = {
    "gruplar": [
        {
            "ad": "Koli Bilgisi",
            "alanlar": [
                {"key": "koli_boy", "label": "Boy (mm)", "tip": "number", "zorunlu": True},
                {"key": "koli_en", "label": "En (mm)", "tip": "number", "zorunlu": True},
                {"key": "koli_yukseklik", "label": "Yükseklik (mm)", "tip": "number", "zorunlu": True},
                {"key": "siparis_miktari", "label": "Sipariş Miktarı", "tip": "int", "zorunlu": True},
            ],
        },
        {
            "ad": "Malzeme",
            "alanlar": [
                {"key": "oluklu_kalite", "label": "Oluklu Kalite", "tip": "lookup", "kaynak": "oluklu_kalite", "zorunlu": True},
                # Levha EN/BOY artık otomatik (koli ölçülerinden formülle)
                {"key": "levha_en", "label": "Levha EN (mm)", "tip": "auto", "formul": "koli_levha_en",
                 "aciklama": "Koli En + Yükseklik + 6"},
                {"key": "levha_boy", "label": "Levha BOY (mm)", "tip": "auto", "formul": "koli_levha_boy",
                 "aciklama": "(Koli En + Koli Boy) × 2 + 30"},
                {"key": "safya_m2_fiyat", "label": "Safya TL/m²", "tip": "number"},
            ],
        },
        {
            "ad": "Baskı",
            "alanlar": [
                # Kritik #1: sadeleştir — baskili / baskisiz
                {"key": "baski_durum", "label": "Baskı Durumu", "tip": "lookup", "kaynak": "baskili_baskisiz"},
                # Kritik #2: Renk Sayısı + Baskı Renkleri
                {"key": "renk_sayisi", "label": "Renk Sayısı", "tip": "int", "min": 0, "max": 6},
                {"key": "renk_kodlari", "label": "Baskı Renkleri", "tip": "renk_multi"},
                {"key": "eklenti", "label": "Eklenti (Dikiş/Yapıştırma)", "tip": "lookup", "kaynak": "eklenti"},
                # Kritik #3: Dikiş Adedi → Dikiş Fiyatı
                {"key": "dikis_fiyati", "label": "Dikiş Fiyatı (TL)", "tip": "number",
                 "aciklama": "Toplam dikiş ücreti — yapıştırma seçildiyse 0"},
                # Not: İlave İşlemler (lak/sıvama/selefon vb.) KOLİ'de kullanılmaz — kaldırıldı.
                # OFSET'te duruyor. calc_koli yine de eski kayıtlarda ilave_islemler'i okur (0 ise etkisiz).
            ],
        },
        {
            "ad": "Sevkiyat & Diğer",
            "alanlar": [
                {"key": "ambalaj_sekli", "label": "Yükleme Şekli", "tip": "lookup", "kaynak": "ambalaj_sekli"},
                {"key": "grafik_durumu", "label": "Grafik", "tip": "lookup", "kaynak": "grafik_durumu"},
                {"key": "klise_gideri", "label": "Klişe Gideri", "tip": "number",
                 "aciklama": "Toplam klişe gideri — sipariş adedine bölünür"},
                {"key": "bicak_gideri", "label": "Bıçak Gideri", "tip": "number",
                 "aciklama": "Toplam bıçak gideri — sipariş adedine bölünür"},
                {"key": "kar_orani", "label": "Kâr Oranı", "tip": "percent", "varsayilan": 0.2},
            ],
        },
    ]
}

KALEM_TIPLERI = [
    ("KUTU_OFSET", "Ofset Kutu", "Roland makinelerle ofset baskılı kutu", KUTU_OFSET_SEMA, "calc_kutu_ofset", 1),
    ("KUTU_FLEKSO", "Flekso Kutu", "Flekso makinelerle baskılı kutu", KUTU_FLEKSO_SEMA, "calc_kutu_flekso", 2),
    ("KOLI", "Koli", "Oluklu mukavva nakliye kolisi", KOLI_SEMA, "calc_koli", 3),
]


# ── BIRİM FİYAT GENEL (HESAPLAMA VERİ DOSYASI) ──────────────────────────

BIRIM_FIYAT_GENEL = {
    "lak_tl_m2": "2.20",
    "sivama_tl_m2": "2.85",
    "kesim_tl": "2.25",
    "yapistirma_tl_ad": "0.85",
    "flekso_baski_kesim_tl": "4.00",
    "flekso_kesim_tl": "2.25",
    "flekso_yapistirma_tl_ad": "1.25",
    "koli_dikis_birim_tl": "2.25",
}


# ── ÇALIŞTIR ─────────────────────────────────────────────────────────────

def upsert(db, model, pk_attr: str, items: list[dict]) -> int:
    count = 0
    for it in items:
        pk_val = it[pk_attr]
        existing = db.query(model).filter(getattr(model, pk_attr) == pk_val).first()
        if existing:
            for k, v in it.items():
                setattr(existing, k, v)
        else:
            db.add(model(**it))
            count += 1
    return count


def main():
    db = SessionLocal()
    try:
        upsert(db, KartonCinsi, "kod", [
            {"kod": k, "ad": a, "sira": i, "aktif": True}
            for i, (k, a) in enumerate(KARTON_CINSI)
        ])
        upsert(db, Gramaj, "deger", [{"deger": g, "aktif": True} for g in GRAMAJLAR])
        upsert(db, BaskiTuru, "kod", [{"kod": k, "ad": a, "aktif": True} for k, a in BASKI_TURU])
        upsert(db, Renk, "kod", [
            {"kod": k, "ad": a, "hex_kod": h, "aktif": True} for k, a, h in RENKLER
        ])
        upsert(db, BaskiSonrasi, "kod", [{"kod": k, "ad": a, "aktif": True} for k, a in BASKI_SONRASI])
        upsert(db, Eklenti, "kod", [{"kod": k, "ad": a, "aktif": True} for k, a in EKLENTILER])
        upsert(db, AmbalajSekli, "kod", [{"kod": k, "ad": a, "aktif": True} for k, a in AMBALAJ])
        upsert(db, GrafikDurumu, "kod", [{"kod": k, "ad": a, "aktif": True} for k, a in GRAFIK])
        upsert(db, OlukluKalite, "kod", [
            {"kod": k, "tip": t, "aktif": True} for k, t in OLUKLU_KALITELER
        ])

        upsert(db, BirimFiyatOfset, "gramaj", [
            {"gramaj": g, "baski_tl": Decimal(t)} for g, t in OFSET_BASKI
        ])
        upsert(db, GecisCarpan, "renk_sayisi", [
            {"renk_sayisi": r, "carpan": Decimal(c)} for r, c in GECIS_CARPANI
        ])

        # birim_fiyat_genel — tek satır
        existing_bfg = db.query(BirimFiyatGenel).filter(BirimFiyatGenel.id == 1).first()
        bfg_data = {k: Decimal(v) for k, v in BIRIM_FIYAT_GENEL.items()}
        if existing_bfg:
            for k, v in bfg_data.items():
                setattr(existing_bfg, k, v)
        else:
            db.add(BirimFiyatGenel(id=1, **bfg_data))

        # Kalem tipleri (registry)
        for kod, ad, aciklama, sema, hesap_fn, sira in KALEM_TIPLERI:
            existing_kt = db.query(KalemTipi).filter(KalemTipi.kod == kod).first()
            if existing_kt:
                existing_kt.ad = ad
                existing_kt.aciklama = aciklama
                existing_kt.alan_semasi = sema
                existing_kt.hesaplama_fn = hesap_fn
                existing_kt.sira = sira
            else:
                db.add(KalemTipi(
                    kod=kod, ad=ad, aciklama=aciklama,
                    alan_semasi=sema, hesaplama_fn=hesap_fn, sira=sira, aktif=True,
                ))

        db.commit()
        print("✅ Master veriler yüklendi.")
    except Exception as e:
        db.rollback()
        print(f"❌ Hata: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
