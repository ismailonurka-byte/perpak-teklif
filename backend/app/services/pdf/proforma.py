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
    sp = k.spesifikasyon or {}
    tip = k.kalem_tipi or ""
    parts = []
    # KUTU_OFSET: baski_turu (Roland 700/800)
    # KUTU_FLEKSO ve KOLI: 'Flekso' etiketi (oluklu kutu makinesi)
    if tip == "KUTU_OFSET":
        if sp.get("baski_turu"):
            parts.append(_human(sp["baski_turu"]))
    elif tip in ("KUTU_FLEKSO", "KOLI"):
        # KOLİ yeni şemada baski_durum (BASKILI/BASKISIZ); flekso baski_turu olabilir.
        baski = sp.get("baski_durum") or sp.get("baski_turu") or ""
        if baski == "BASKISIZ":
            return "Baskısız"
        parts.append("Flekso")

    renk = sp.get("renk_sayisi")
    if renk and int(renk) > 0:
        parts.append(f"{int(renk)} renk")
    return " · ".join(parts) or "—"


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
