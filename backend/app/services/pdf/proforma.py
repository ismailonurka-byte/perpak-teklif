"""Proforma PDF üretimi — WeasyPrint ile HTML şablonundan.

WeasyPrint sistem kütüphaneleri (pango, cairo) gerektirir. Yüklenmemişse lazy import
ile yalnızca çağrıldığında hata verir — uygulamanın başlangıcını engellemez.
"""
from decimal import Decimal
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape


TEMPLATE_DIR = Path(__file__).parent / "templates"
LOGO_PATH = TEMPLATE_DIR / "perpak_logo.jpeg"


env = Environment(
    loader=FileSystemLoader(TEMPLATE_DIR),
    autoescape=select_autoescape(["html"]),
)


def _tl(v) -> str:
    if v is None:
        return "—"
    d = Decimal(str(v))
    s = f"{d:,.2f}"
    return s.replace(",", "X").replace(".", ",").replace("X", ".") + " ₺"


# Sık geçen kodlar için Türkçe doğru yazım — geri kalan _human() ile Title()
KOD_ADI: dict[str, str] = {
    "KUSESIZ_KROMA": "Kuşesiz Kroma",
    "KROMA": "Kroma",
    "BRISTOL": "Bristol",
    "BT_LINER": "BT Liner",
    "KRAFT": "Kraft",
    "ROLAND_700": "Roland 700",
    "ROLAND_800": "Roland 800",
    "FLEKSO": "Flekso",
    "BASKISIZ": "Baskısız",
    "CMYK": "CMYK",
    "SIYAH": "Siyah",
    "KIRMIZI": "Kırmızı",
    "MAVI": "Mavi",
    "DISPERSIYON_LAK": "Dispersiyon Lak",
    "UV_LAK": "UV Lak",
    "PARLAK_SELEFON": "Parlak Selefon",
    "MAT_SELEFON": "Mat Selefon",
    "HIGHLOSS": "Highloss",
    "KISMI_LAK": "Kısmi Lak",
    "TERMO_LAK": "Termo Lak",
    "GOFRE": "Gofre",
    "ASETAT": "Asetat",
    "SELEFON_PENCERE_KESIM": "Selefon + Pencere Kesim",
    "KUS_GOZU": "Kuş Gözü",
    "KILITLI": "Kilitli",
    "YAPISTIRMA": "Yapıştırma",
    "DIKIS": "Dikiş",
    "SHRINKSIZ_DOKME": "Shrinksiz Dökme",
    "SHRINKLI_DOKME": "Shrinkli Dökme",
    "SHRINKSIZ_PALETLI": "Shrinksiz Paletli",
    "SHRINKLI_PALETLI": "Shrinkli Paletli",
    "PALETLI": "Paletli",
    "DOKME": "Dökme",
    "LAK": "Lak",
    "SIVAMA": "Sıvama",
    "BASKILI": "Baskılı",
    "YOK": "Yok",
}


def _human(s: str | None) -> str:
    """KOD_ADI sözlüğünden doğru Türkçe karşılığı al, yoksa Title() ile çevir."""
    if not s:
        return ""
    if s in KOD_ADI:
        return KOD_ADI[s]
    return s.replace("_", " ").title()


def _kagit_kalitesi(k) -> str:
    sp = k.spesifikasyon or {}
    tip = k.kalem_tipi or ""
    if tip == "KUTU_OFSET":
        return _human(sp.get("karton_cinsi")) or "—"
    # KUTU_FLEKSO ve KOLI için oluklu kalitesi
    return sp.get("oluklu_kalite") or "—"


def _baski_metni(k) -> str:
    """Baskı sütunu — MAKİNE ADI yazılmaz; RENK İSİMLERİ gösterilir (kullanıcı talebi).

    Öncelik: renk_kodlari (renk isimleri) → yoksa renk_sayisi ("N renk") → yoksa "—".
    Baskısız ise "Baskısız".
    """
    sp = k.spesifikasyon or {}
    if sp.get("baski_durum") == "BASKISIZ" or sp.get("baski_turu") == "BASKISIZ":
        return "Baskısız"

    # Renk isimleri (CMYK, Siyah, Kırmızı ...) — makine adı (Flekso/Roland) gösterilmez
    renkler = sp.get("renk_kodlari")
    if isinstance(renkler, list) and renkler:
        adlar = [_human(r) for r in renkler if r]
        if adlar:
            return ", ".join(adlar)

    # Renk isimleri yoksa yedek: renk sayısı (yine makine adı yok)
    renk = sp.get("renk_sayisi")
    if renk and int(renk) > 0:
        return f"{int(renk)} renk"
    return "—"


def _diger_islemler(k) -> str:
    sp = k.spesifikasyon or {}
    items: list[str] = []

    # ── Yeni şema: ilave_islemler = {kod: fiyat} (lak, sıvama vb.) ──
    ilave = sp.get("ilave_islemler")
    if isinstance(ilave, dict):
        for kod, fiyat in ilave.items():
            if fiyat not in (None, "", 0, 0.0):
                items.append(_human(kod))

    # ── OFSET kesim/yapıştırma ──
    if sp.get("kesim_tl") not in (None, "", 0, 0.0):
        items.append("Kesim")
    if sp.get("yapistirma_tl_ad") not in (None, "", 0, 0.0):
        items.append("Yapıştırma")

    # ── Eklenti (Yapıştırma/Dikiş/Kilitli) ──
    if sp.get("eklenti") and sp.get("eklenti") != "YOK":
        items.append(_human(sp["eklenti"]))

    # ── Dikiş — yeni: dikis_fiyati, eski: dikis_adedi ──
    if sp.get("dikis_fiyati") not in (None, "", 0, 0.0):
        items.append("Dikiş")
    elif sp.get("dikis_adedi") and int(sp.get("dikis_adedi", 0)) > 0:
        items.append(f"Dikiş ({sp['dikis_adedi']} ad.)")

    # ── Geriye uyumluluk: eski şema anahtarları ──
    baski_sonrasi = sp.get("baski_sonrasi", []) or []
    has_lak_post = any("LAK" in x for x in baski_sonrasi)
    if sp.get("lak_aktif") and not has_lak_post:
        items.append("Lak")
    if sp.get("sivama_aktif"):
        items.append("Sıvama")
    for x in baski_sonrasi:
        items.append(_human(x))

    # Mükerrerleri sırayı bozmadan temizle
    seen: set[str] = set()
    uniq = [x for x in items if not (x in seen or seen.add(x))]
    return ", ".join(uniq) if uniq else "—"


env.filters["tl"] = _tl
env.globals["tl"] = _tl
env.globals["kagit_kalitesi"] = _kagit_kalitesi
env.globals["baski_metni"] = _baski_metni
env.globals["diger_islemler"] = _diger_islemler


# ─────────────────────────────────────────────────────────────────────────────
# SİPARİŞ FORMU (iç / ERP girişi) — tüm alanlar + maliyet kırılımı
# ─────────────────────────────────────────────────────────────────────────────

# hesap_detayi anahtarları → Türkçe etiket (frontend KalemDrawer ile aynı)
DETAY_ETIKET: dict[str, str] = {
    "karton_tl": "Karton", "ondule_tl": "Oluklu", "oluklu_tl": "Oluklu", "baski_tl": "Baskı",
    "lak_tl": "Lak", "sivama_tl": "Sıvama", "kesim_tl": "Kesim", "yapistirma_tl": "Yapıştırma",
    "ilave_islemler_tl": "İlave İşlemler", "levha_tl": "Levha", "dikis_tl": "Dikiş",
    "alt_toplam": "Alt Toplam", "tabaka_adet": "Tabaka Adedi", "acinim": "Açınım",
    "montaj_kutu_adet": "Toplam Üretim Adedi", "ek_gecis_adedi": "Ek Geçiş Adedi",
    "gecis_carpan_kullanilan": "Geçiş Çarpanı", "kalip_gideri": "Kalıp Gideri (Toplam)",
    "kalip_gideri_birim": "Kalıp Gideri / Ürün Başına", "diger_gider": "Diğer Gider",
    "diger_gider_birim": "Diğer Gider (Ürün Başına)", "klise_gideri": "Klişe Gideri",
    "bicak_gideri": "Bıçak Gideri", "birim_klise_gideri": "Birim Klişe Gideri",
    "birim_bicak_gideri": "Birim Bıçak Gideri", "kar_orani": "Kâr Oranı",
    "siparis_miktari": "Sipariş Miktarı",
}
_DETAY_ORAN = {"kar_orani"}
_DETAY_ADET = {"montaj_kutu_adet", "siparis_miktari", "tabaka_adet", "acinim", "ek_gecis_adedi"}


def _deger_metni(alan: dict, value) -> str:
    """Bir spec alanını insan-okur metne çevirir (alan tipine göre)."""
    tip = alan.get("tip")
    if value in (None, "", []):
        return "—"
    if tip in ("lookup",):
        return _human(str(value))
    if tip in ("renk_multi", "lookup_multi"):
        if isinstance(value, list):
            return ", ".join(_human(str(v)) for v in value) or "—"
        return _human(str(value))
    if tip == "percent":
        try:
            return f"%{float(value) * 100:.0f}"
        except (TypeError, ValueError):
            return str(value)
    if tip == "bool":
        return "Evet" if value else "Hayır"
    if tip == "ilave_islemler":
        if isinstance(value, dict):
            return ", ".join(f"{_human(k)}: {_tl(v)}" for k, v in value.items() if v) or "—"
        return "—"
    if tip == "secmeli":
        return _tl(value) if isinstance(value, (int, float)) else str(value)
    return str(value)


def _detay_metni(k: str, v) -> str:
    if not isinstance(v, (int, float)):
        return str(v)
    if k in _DETAY_ORAN:
        return f"%{v * 100:.0f}"
    if k in _DETAY_ADET:
        return f"{v:,.0f}".replace(",", ".")
    return _tl(v)


def render_siparis_pdf(teklif, semalar: dict) -> bytes:
    """Sipariş formu PDF'i — her kalem için tüm alanlar + maliyet kırılımı.

    semalar: {kalem_tipi_kod: {"ad": <ad>, "sema": <alan_semasi dict>}}
    """
    try:
        from weasyprint import HTML
    except (OSError, ImportError) as e:
        raise RuntimeError("WeasyPrint sistem kütüphaneleri (pango/cairo) yüklü değil. Hata: " + str(e))

    kalemler_view = []
    for k in sorted(teklif.kalemler, key=lambda x: x.sira_no):
        info = semalar.get(k.kalem_tipi) or {}
        sema = info.get("sema") or {"gruplar": []}
        spec = k.spesifikasyon or {}
        gruplar = []
        for g in sema.get("gruplar", []):
            satirlar = [(a.get("label", a.get("key")), _deger_metni(a, spec.get(a.get("key"))))
                        for a in g.get("alanlar", [])]
            if satirlar:
                gruplar.append({"ad": g.get("ad", ""), "satirlar": satirlar})
        maliyet = [(DETAY_ETIKET.get(dk, dk), _detay_metni(dk, dv))
                   for dk, dv in (k.hesap_detayi or {}).items()]
        kalemler_view.append({
            "sira_no": k.sira_no, "urun_ismi": k.urun_ismi,
            "kalem_tipi_ad": info.get("ad") or k.kalem_tipi,
            "adet": k.adet, "birim_fiyat": k.birim_fiyat, "toplam": k.toplam,
            "notlar": k.notlar, "gruplar": gruplar, "maliyet": maliyet,
        })

    tpl = env.get_template("siparis_formu.html")
    html = tpl.render(t=teklif, kalemler=kalemler_view, logo_path=str(LOGO_PATH))
    return HTML(string=html, base_url=str(TEMPLATE_DIR)).write_pdf()


def render_proforma_pdf(teklif) -> bytes:
    """Teklif modelini PDF byte'larına çevirir."""
    try:
        from weasyprint import HTML
    except (OSError, ImportError) as e:
        raise RuntimeError(
            "WeasyPrint sistem kütüphaneleri (pango/cairo) yüklü değil. "
            "macOS: `brew install pango`. Hata: " + str(e)
        )
    tpl = env.get_template("proforma.html")
    html = tpl.render(t=teklif, logo_path=str(LOGO_PATH))
    return HTML(string=html, base_url=str(TEMPLATE_DIR)).write_pdf()
