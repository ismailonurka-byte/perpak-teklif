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
    Izin("dashboard.read", "Paneli Görüntüle", "Genel", "Panel", "Görüntüle",
         "Ana panel özet kartlarını ve son teklifleri görür", sira=10),

    # ── Teklifler (Satış) ──
    Izin("teklif.read", "Teklifleri Görüntüle", "Satış", "Teklifler", "Görüntüle",
         "Teklif listesini, Kanban'ı ve teklif detayını açar", kapsam=True, sira=20),
    Izin("teklif.create", "Teklif Oluştur", "Satış", "Teklifler", "Oluştur",
         "Yeni teklif ekler", sira=21),
    Izin("teklif.update", "Teklif Düzenle", "Satış", "Teklifler", "Düzenle",
         "Mevcut teklifi ve kalemlerini düzenler", kapsam=True, sira=22),
    Izin("teklif.delete", "Teklif Sil", "Satış", "Teklifler", "Sil",
         "Teklif (taslak) siler", kapsam=True, sira=23),
    Izin("teklif.durum", "Teklif Durumu Değiştir", "Satış", "Teklif Detay", "Durum",
         "Teklifi onayla/reddet/beklet/siparişe çevir", kapsam=True, sira=24),
    Izin("teklif.pdf", "Teklif PDF İndir", "Satış", "Teklif Detay", "İndir",
         "Proforma PDF'i üretir/indirir", kapsam=True, sira=25),
    Izin("teklif.siparis", "Sipariş Formu İndir", "Satış", "Teklif Detay", "İndir",
         "Sipariş formu PDF'i (tüm alanlar + maliyet kırılımı, ERP girişi için)", kapsam=True, sira=27),
    Izin("maliyet.read", "Maliyet & Kâr Görüntüle", "Satış", "Teklif Detay", "Görüntüle",
         "Kalem maliyeti ve kâr marjını gösterir (HASSAS bilgi)", sira=26),

    # ── Müşteriler ──
    Izin("firma.read", "Müşterileri Görüntüle", "Satış", "Müşteriler", "Görüntüle",
         "Müşteri listesini ve detayını görür", sira=30),
    Izin("firma.create", "Müşteri Oluştur", "Satış", "Müşteriler", "Oluştur",
         "Yeni müşteri ekler", sira=31),
    Izin("firma.update", "Müşteri Düzenle", "Satış", "Müşteriler", "Düzenle",
         "Mevcut müşteriyi düzenler", sira=32),

    # ── Raporlar ──
    Izin("rapor.read", "Raporları Görüntüle", "Raporlama", "Raporlar", "Görüntüle",
         "Dönüşüm ve performans raporlarını açar", sira=40),

    # ── Fiyat Yönetimi ──
    Izin("fiyat.read", "Fiyatları Görüntüle", "Yönetim", "Fiyat Yönetimi", "Görüntüle",
         "Birim fiyat listelerini görür", sira=50),
    Izin("fiyat.update", "Fiyatları Düzenle", "Yönetim", "Fiyat Yönetimi", "Düzenle",
         "Birim fiyatları günceller", sira=51),

    # ── Master Veriler (karton, gramaj, kalem tipi vb.) ──
    Izin("master.read", "Master Verileri Görüntüle", "Yönetim", "Master Veriler", "Görüntüle",
         "Karton/gramaj/kalem tipi gibi tanım verilerini görür", sira=60),
    Izin("master.update", "Master Verileri Düzenle", "Yönetim", "Master Veriler", "Düzenle",
         "Tanım/lookup verilerini günceller", sira=61),

    # ── Kullanıcı & Rol Yönetimi ──
    Izin("kullanici.manage", "Kullanıcıları Yönet", "Yönetim", "Kullanıcılar", "Yönet",
         "Kullanıcı oluşturur, düzenler, rol atar", sira=70),
    Izin("rol.manage", "Rolleri Yönet", "Yönetim", "Roller", "Yönet",
         "Rol oluşturur/siler ve rollere izin atar", sira=71),
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
