"""Raporlama endpoint'leri.

İlk rapor: Teklif → Sipariş dönüşüm tarih aralıkları.
Her teklif için:
  - Oluşturma tarihi (teklif kart açıldığı an)
  - "Teklif Verildi" tarihi (müşteriye gönderildiği an)
  - "Sipariş" tarihi (siparişe dönüştüğü an)
  - Süreler (gün cinsinden)
"""
from datetime import date, datetime
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import joinedload

from app.core.deps import DbSession, require_permission
from app.db.models import Kullanici, Teklif, TeklifDurumLog

router = APIRouter()


def _gun_farki(a: datetime | None, b: datetime | None) -> int | None:
    if a is None or b is None:
        return None
    return (b - a).days


@router.get("/teklif-donusum")
def teklif_donusum(
    db: DbSession,
    user: Annotated[Kullanici, Depends(require_permission("rapor.read"))],
    baslangic: date | None = Query(default=None, description="Sipariş tarihi alt sınır"),
    bitis: date | None = Query(default=None, description="Sipariş tarihi üst sınır"),
    sadece_siparis: bool = Query(default=False, description="True: yalnız siparişe dönmüş olanlar"),
    benim_mi: bool = Query(default=False, description="True: yalnız kendi tekliflerim"),
):
    """Tüm teklifler için oluşturma + teklif verme + sipariş tarihlerini döner."""
    # Teklifleri getir
    teklif_qry = (
        db.query(Teklif)
        .options(joinedload(Teklif.firma), joinedload(Teklif.olusturan))
    )
    if user.rol == "SATIS" or benim_mi:
        teklif_qry = teklif_qry.filter(Teklif.olusturan_id == user.id)
    teklifler = teklif_qry.all()

    # Logları getir — tek seferde, sonra teklif bazında grupla
    log_rows = (
        db.query(TeklifDurumLog.teklif_id, TeklifDurumLog.yeni_durum, TeklifDurumLog.ts)
        .order_by(TeklifDurumLog.ts.asc())
        .all()
    )
    log_map: dict = {}
    for tid, yeni_durum, ts in log_rows:
        log_map.setdefault(tid, {}).setdefault(yeni_durum, ts)
        # setdefault → her durum için yalnız İLK geçişi saklar

    satirlar = []
    toplam_teklif = 0
    siparise_donen = 0
    toplam_donusum_gun = 0
    donusum_sayisi = 0
    toplam_siparis_tutari = Decimal("0")

    for t in teklifler:
        gecisler = log_map.get(t.id, {})
        olusturma = t.olusturma_ts
        teklif_verme = gecisler.get("TEKLIF_VERILDI")
        kabul = gecisler.get("KABUL")
        siparis = gecisler.get("SIPARIS")

        # Tarih aralığı filtresi: sipariş tarihi içeride mi?
        if baslangic and (not siparis or siparis.date() < baslangic):
            if sadece_siparis:
                continue
        if bitis and (not siparis or siparis.date() > bitis):
            if sadece_siparis:
                continue
        if sadece_siparis and not siparis:
            continue

        toplam_teklif += 1
        if siparis:
            siparise_donen += 1
            toplam_siparis_tutari += t.genel_toplam
            gun = _gun_farki(teklif_verme or olusturma, siparis)
            if gun is not None and gun >= 0:
                toplam_donusum_gun += gun
                donusum_sayisi += 1

        satirlar.append({
            "teklif_id": str(t.id),
            "teklif_no": t.teklif_no,
            "firma_adi": t.firma.ad,
            "olusturan_ad": t.olusturan.ad_soyad,
            "su_anki_durum": t.durum,
            "tutar": float(t.genel_toplam),
            "olusturma_ts": olusturma.isoformat() if olusturma else None,
            "teklif_verme_ts": teklif_verme.isoformat() if teklif_verme else None,
            "kabul_ts": kabul.isoformat() if kabul else None,
            "siparis_ts": siparis.isoformat() if siparis else None,
            "olusum_siparis_gun": _gun_farki(olusturma, siparis),
            "teklif_siparis_gun": _gun_farki(teklif_verme, siparis),
        })

    ortalama_donusum = (toplam_donusum_gun / donusum_sayisi) if donusum_sayisi else None
    donusum_orani = round((siparise_donen / toplam_teklif) * 100) if toplam_teklif else 0

    return {
        "ozet": {
            "toplam_teklif": toplam_teklif,
            "siparise_donen": siparise_donen,
            "donusum_orani_yuzde": donusum_orani,
            "ortalama_donusum_gun": round(ortalama_donusum, 1) if ortalama_donusum is not None else None,
            "toplam_siparis_tutari": float(toplam_siparis_tutari),
        },
        "satirlar": satirlar,
    }
