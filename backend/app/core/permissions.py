"""İzin kataloğu — RBAC'ın tek kaynağı (source of truth).

KURAL: Bir ekran (sayfa/endpoint) yazıldığında, izni de AYNI ANDA buraya eklenir.
Her izin; hangi MODÜL/EKRAN'a ait olduğunu, hangi AKSİYONU yaptığını ve NE AMAÇLA
kullanıldığını net taşır. Uygulama açılışında bu katalog DB'deki `izin` tablosuna
upsert edilir; admin "Roller" ekranında bunları modül/ekran gruplu görüp rollere atar.

İzin kodu formatı: "<alan>.<aksiyon>"  (örn: teklif.read, fiyat.update)
`kapsam=True` olan izinler satır-bazlı kapsam (own/all) destekler.
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Izin:
    kod: str            # makine kodu, benzersiz (teklif.read)
    gorunen_ad: str     # kullanıcıya görünen ad (Teklifleri Görüntüle)
    modul: str          # üst grup (Satış, Yönetim, Üretim...)
    ekran: str          # hangi ekran/sayfa (Teklifler)
    aksiyon: str        # Görüntüle / Oluştur / Düzenle / Sil / Durum / İndir / Yönet
    aciklama: str       # ne amaçla kullanılır
    kapsam: bool = False  # own/all kapsamı destekler mi
    sira: int = 0


# ─────────────────────────────────────────────────────────────────────────────
# KATALOG — mevcut ekranlar
# ─────────────────────────────────────────────────────────────────────────────
KATALOG: list[Izin] = [
    # ── Panel / Dashboard ──
    Izin("dashboard.read", "Genel Bakış'ı Görüntüle", "Genel", "Genel Bakış", "Görüntüle",
         "Genel Bakış: özet KPI, aksiyon gerektirenler ve hızlı eylemler", sira=10),

    # ── Teklif ──
    Izin("teklif.read", "Teklifleri Görüntüle", "Teklif", "Teklifler", "Görüntüle",
         "Teklif listesini, Kanban'ı ve teklif detayını açar", kapsam=True, sira=20),
    Izin("teklif.create", "Teklif Oluştur", "Teklif", "Teklifler", "Oluştur",
         "Yeni teklif ekler", sira=21),
    Izin("teklif.update", "Teklif Düzenle", "Teklif", "Teklifler", "Düzenle",
         "Mevcut teklifi ve kalemlerini düzenler", kapsam=True, sira=22),
    Izin("teklif.delete", "Teklif Sil", "Teklif", "Teklifler", "Sil",
         "Teklif (taslak) siler", kapsam=True, sira=23),
    Izin("teklif.durum", "Teklif Durumu Değiştir", "Teklif", "Teklif Detay", "Durum",
         "Teklifi onayla/reddet/beklet/siparişe çevir", kapsam=True, sira=24),
    Izin("teklif.pdf", "Teklif PDF İndir", "Teklif", "Teklif Detay", "İndir",
         "Proforma PDF'i üretir/indirir", kapsam=True, sira=25),
    Izin("teklif.siparis", "Sipariş Formu İndir", "Teklif", "Teklif Detay", "İndir",
         "Sipariş formu PDF'i (tüm alanlar + maliyet kırılımı, ERP girişi için)", kapsam=True, sira=27),
    Izin("maliyet.read", "Maliyet & Kâr Görüntüle", "Teklif", "Teklif Detay", "Görüntüle",
         "Kalem maliyeti ve kâr marjını gösterir (HASSAS bilgi)", sira=26),

    # ── Tanımlar › Müşteriler ──
    Izin("firma.read", "Müşterileri Görüntüle", "Tanımlar", "Müşteriler", "Görüntüle",
         "Müşteri listesini ve detayını görür", sira=30),
    Izin("firma.create", "Müşteri Oluştur", "Tanımlar", "Müşteriler", "Oluştur",
         "Yeni müşteri ekler", sira=31),
    Izin("firma.update", "Müşteri Düzenle", "Tanımlar", "Müşteriler", "Düzenle",
         "Mevcut müşteriyi düzenler", sira=32),

    # ── Tanımlar › Fiyatlar ──
    Izin("fiyat.read", "Fiyatları Görüntüle", "Tanımlar", "Fiyatlar", "Görüntüle",
         "Birim fiyat listelerini görür", sira=40),
    Izin("fiyat.update", "Fiyatları Düzenle", "Tanımlar", "Fiyatlar", "Düzenle",
         "Birim fiyatları günceller", sira=41),

    # ── Tanımlar › Master Veriler (karton, gramaj, kalem tipi vb.) ──
    Izin("master.read", "Master Verileri Görüntüle", "Tanımlar", "Master Veriler", "Görüntüle",
         "Karton/gramaj/kalem tipi gibi tanım verilerini görür", sira=50),
    Izin("master.update", "Master Verileri Düzenle", "Tanımlar", "Master Veriler", "Düzenle",
         "Tanım/lookup verilerini günceller", sira=51),

    # ── Teklif Takip ──
    Izin("rapor.read", "Teklif Takip Dashboard'u Görüntüle", "Teklif Takip", "Teklif Takip Dashboard", "Görüntüle",
         "Teklif → sipariş dönüşüm ve performans dashboard'unu açar", sira=60),

    # ── Yönetim › Ayarlar ──
    Izin("kullanici.manage", "Kullanıcıları Yönet", "Yönetim", "Ayarlar", "Yönet",
         "Ayarlar > Kullanıcılar: kullanıcı oluşturur, düzenler, rol atar", sira=70),
    Izin("rol.manage", "Rolleri Yönet", "Yönetim", "Ayarlar", "Yönet",
         "Ayarlar > Roller: rol oluşturur/siler ve rollere izin atar", sira=71),
]

KATALOG_KODLARI: set[str] = {p.kod for p in KATALOG}


# ─────────────────────────────────────────────────────────────────────────────
# VARSAYILAN ROLLER (seed) — sadece yoksa oluşturulur, sonradan admin değiştirebilir
# (kod, kapsam) — kapsam None ise izin kapsamsız, "own"/"all" satır bazlı
# ─────────────────────────────────────────────────────────────────────────────
YONETICI_ROL = "Yönetici"  # sistem rolü: HER ZAMAN tüm izinlere sahip

# İsteğe bağlı yardımcı rol: Satış (projede yardımcı olması için)
SATIS_ROL = "Satış"
SATIS_VARSAYILAN: list[tuple[str, str | None]] = [
    ("dashboard.read", None),
    ("teklif.read", "own"),
    ("teklif.create", None),
    ("teklif.update", "own"),
    ("teklif.durum", "own"),
    ("teklif.pdf", "own"),
    ("maliyet.read", None),
    ("firma.read", None),
    ("firma.create", None),
    ("firma.update", None),
    ("rapor.read", None),
    ("fiyat.read", None),
]
