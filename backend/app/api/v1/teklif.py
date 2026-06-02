"""Teklif CRUD + polimorfik kalem yönetimi + durum akışı."""
from datetime import date, datetime, timezone
from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy import func, select
from sqlalchemy.orm import joinedload

from app.core.deps import CurrentUser, DbSession, require_satis_or_admin
from app.db.models import Firma, Kullanici, Teklif, TeklifDurumLog, TeklifKalem
from app.schemas.teklif import (
    TeklifCreate, TeklifKalemCreate, TeklifListItem, TeklifOut, TeklifUpdate,
)

router = APIRouter()


def _gen_teklif_no(db) -> str:
    yil = datetime.now().year % 100
    sayac = db.query(func.count(Teklif.id)).scalar() or 0
    return f"TKL-{yil:02d}-{(sayac + 1):04d}"


def _hesapla_toplam(t: Teklif) -> None:
    ara = sum((k.toplam or Decimal(0) for k in t.kalemler), Decimal(0))
    t.ara_toplam = ara
    t.kdv_tutari = (ara * t.kdv_orani).quantize(Decimal("0.01"))
    t.genel_toplam = ara + t.kdv_tutari


# ─── LİSTE ───────────────────────────────────────────────────────────────

@router.get("", response_model=list[TeklifListItem])
def liste(
    db: DbSession,
    user: Kullanici = Depends(require_satis_or_admin),
    durum: str | None = Query(default=None),
    benim_mi: bool = Query(default=False),
    arama: str | None = Query(default=None),
    limit: int = Query(default=50, le=1000),
    offset: int = Query(default=0, ge=0),
):
    qry = (
        db.query(Teklif)
        .options(joinedload(Teklif.firma), joinedload(Teklif.olusturan))
    )
    # SATIS sadece kendi tekliflerini görür; ADMIN her şeyi
    if user.rol == "SATIS" or benim_mi:
        qry = qry.filter(Teklif.olusturan_id == user.id)
    if durum:
        qry = qry.filter(Teklif.durum == durum)
    if arama:
        like = f"%{arama}%"
        qry = qry.join(Firma).filter(
            (Teklif.teklif_no.ilike(like)) | (Firma.ad.ilike(like))
        )

    rows = qry.order_by(Teklif.son_aktivite_ts.desc()).offset(offset).limit(limit).all()
    return [
        TeklifListItem(
            id=t.id,
            teklif_no=t.teklif_no,
            firma_adi=t.firma.ad,
            olusturan_ad=t.olusturan.ad_soyad,
            tarih=t.tarih,
            genel_toplam=t.genel_toplam,
            durum=t.durum,
            son_aktivite_ts=t.son_aktivite_ts,
        )
        for t in rows
    ]


# ─── DETAY ───────────────────────────────────────────────────────────────

@router.get("/{teklif_id}", response_model=TeklifOut)
def detay(teklif_id: UUID, db: DbSession, user: Kullanici = Depends(require_satis_or_admin)):
    t = (
        db.query(Teklif)
        .options(
            joinedload(Teklif.firma),
            joinedload(Teklif.olusturan),
            joinedload(Teklif.atanan),
            joinedload(Teklif.kalemler),
        )
        .filter(Teklif.id == teklif_id)
        .first()
    )
    if not t:
        raise HTTPException(status_code=404, detail="Teklif bulunamadı")
    if user.rol == "SATIS" and t.olusturan_id != user.id and t.atanan_id != user.id:
        raise HTTPException(status_code=403, detail="Bu teklife erişim yetkiniz yok")
    return t


# ─── OLUŞTUR ─────────────────────────────────────────────────────────────

@router.post("", response_model=TeklifOut, status_code=201)
def olustur(
    payload: TeklifCreate,
    db: DbSession,
    user: Kullanici = Depends(require_satis_or_admin),
):
    firma = db.query(Firma).filter(Firma.id == payload.firma_id).first()
    if not firma:
        raise HTTPException(status_code=400, detail="Firma bulunamadı")

    atanan_id = payload.atanan_id or user.id
    # SATIS kendisi dışında birine atayamaz
    if user.rol == "SATIS" and atanan_id != user.id:
        raise HTTPException(status_code=403, detail="Yalnız kendinize teklif atayabilirsiniz")

    t = Teklif(
        teklif_no=_gen_teklif_no(db),
        firma_id=payload.firma_id,
        olusturan_id=user.id,
        atanan_id=atanan_id,
        yetkili=payload.yetkili,
        tarih=payload.tarih,
        gecerlilik=payload.gecerlilik,
        vade_metni=payload.vade_metni,
        sevk_yeri=payload.sevk_yeri,
        kdv_orani=payload.kdv_orani,
        notlar=payload.notlar,
        durum="TASLAK",
    )
    for k in payload.kalemler:
        t.kalemler.append(TeklifKalem(
            sira_no=k.sira_no,
            kalem_tipi=k.kalem_tipi,
            urun_ismi=k.urun_ismi,
            adet=k.adet,
            birim_fiyat=k.birim_fiyat,
            toplam=k.toplam if k.toplam is not None else (Decimal(k.adet) * k.birim_fiyat),
            termin=k.termin,
            spesifikasyon=k.spesifikasyon,
            hesap_detayi=k.hesap_detayi,
            notlar=k.notlar,
        ))
    _hesapla_toplam(t)
    db.add(t)
    db.flush()  # teklif.id'yi al
    # İlk durum logu — "OLUSTURULDU → TASLAK"
    db.add(TeklifDurumLog(
        teklif_id=t.id,
        eski_durum=None,
        yeni_durum="TASLAK",
        degistiren_id=user.id,
        aciklama="Teklif oluşturuldu",
    ))
    db.commit()
    db.refresh(t)
    return t


# ─── GÜNCELLE ────────────────────────────────────────────────────────────

@router.patch("/{teklif_id}", response_model=TeklifOut)
def guncelle(
    teklif_id: UUID,
    payload: TeklifUpdate,
    db: DbSession,
    user: Kullanici = Depends(require_satis_or_admin),
):
    t = db.query(Teklif).filter(Teklif.id == teklif_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Teklif bulunamadı")
    if user.rol == "SATIS" and t.olusturan_id != user.id:
        raise HTTPException(status_code=403, detail="Bu teklifi düzenleyemezsiniz")

    data = payload.model_dump(exclude_unset=True)
    eski_durum = t.durum

    # SATIS kendi teklifini başkasına atayamaz
    if user.rol == "SATIS" and "atanan_id" in data and data["atanan_id"] != user.id:
        raise HTTPException(status_code=403, detail="Atama yetkiniz yok")

    if "kalemler" in data and data["kalemler"] is not None:
        # Tam değiştir
        t.kalemler.clear()
        db.flush()
        for k in payload.kalemler:
            t.kalemler.append(TeklifKalem(
                sira_no=k.sira_no,
                kalem_tipi=k.kalem_tipi,
                urun_ismi=k.urun_ismi,
                adet=k.adet,
                birim_fiyat=k.birim_fiyat,
                toplam=k.toplam if k.toplam is not None else (Decimal(k.adet) * k.birim_fiyat),
                termin=k.termin,
                spesifikasyon=k.spesifikasyon,
                hesap_detayi=k.hesap_detayi,
                notlar=k.notlar,
            ))
        data.pop("kalemler")

    for key, val in data.items():
        setattr(t, key, val)

    t.son_aktivite_ts = datetime.now(timezone.utc)
    _hesapla_toplam(t)

    if "durum" in data and data["durum"] != eski_durum:
        db.add(TeklifDurumLog(
            teklif_id=t.id,
            eski_durum=eski_durum,
            yeni_durum=data["durum"],
            degistiren_id=user.id,
            aciklama=data.get("durum_aciklama"),
        ))
        if data["durum"] in ("KABUL", "SIPARIS", "RED", "IPTAL"):
            t.kapanma_ts = datetime.now(timezone.utc)

    db.commit()
    db.refresh(t)
    return t


# ─── SİL ─────────────────────────────────────────────────────────────────

@router.delete("/{teklif_id}", status_code=204)
def sil(teklif_id: UUID, db: DbSession, user: Kullanici = Depends(require_satis_or_admin)):
    t = db.query(Teklif).filter(Teklif.id == teklif_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Teklif bulunamadı")
    if user.rol != "ADMIN" and t.olusturan_id != user.id:
        raise HTTPException(status_code=403, detail="Silme yetkiniz yok")
    # Sadece TASLAK silinebilir; diğerlerinde IPTAL durumuna çevrilmeli
    if t.durum != "TASLAK" and user.rol != "ADMIN":
        raise HTTPException(status_code=400, detail="Yalnızca taslakları silebilirsiniz")
    db.delete(t)
    db.commit()


# ─── DURUM LOG ──────────────────────────────────────────────────────────

@router.get("/{teklif_id}/durum-log")
def durum_log(teklif_id: UUID, db: DbSession, user: Kullanici = Depends(require_satis_or_admin)):
    t = db.query(Teklif).filter(Teklif.id == teklif_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Teklif bulunamadı")
    if user.rol == "SATIS" and t.olusturan_id != user.id and t.atanan_id != user.id:
        raise HTTPException(status_code=403, detail="Erişim yetkiniz yok")

    logs = (
        db.query(TeklifDurumLog)
        .options(joinedload(TeklifDurumLog.degistiren))
        .filter(TeklifDurumLog.teklif_id == teklif_id)
        .order_by(TeklifDurumLog.ts.asc())
        .all()
    )
    return [
        {
            "id": str(l.id),
            "eski_durum": l.eski_durum,
            "yeni_durum": l.yeni_durum,
            "degistiren_ad": l.degistiren.ad_soyad,
            "degistiren_id": str(l.degistiren_id),
            "aciklama": l.aciklama,
            "ts": l.ts.isoformat(),
        }
        for l in logs
    ]


# ─── PDF ÜRETİMİ ─────────────────────────────────────────────────────────

@router.get("/{teklif_id}/pdf")
def pdf_indir(teklif_id: UUID, db: DbSession, user: Kullanici = Depends(require_satis_or_admin)):
    from app.services.pdf import render_proforma_pdf

    t = (
        db.query(Teklif)
        .options(
            joinedload(Teklif.firma),
            joinedload(Teklif.olusturan),
            joinedload(Teklif.kalemler),
        )
        .filter(Teklif.id == teklif_id)
        .first()
    )
    if not t:
        raise HTTPException(status_code=404, detail="Teklif bulunamadı")
    if user.rol == "SATIS" and t.olusturan_id != user.id and t.atanan_id != user.id:
        raise HTTPException(status_code=403, detail="Erişim yetkiniz yok")

    pdf_bytes = render_proforma_pdf(t)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{t.teklif_no}.pdf"'},
    )


# ─── İSTATİSTİKLER (Dashboard) ──────────────────────────────────────────

@router.get("/_/ozet")
def ozet(db: DbSession, user: Kullanici = Depends(require_satis_or_admin)):
    base = db.query(Teklif)
    if user.rol == "SATIS":
        base = base.filter(Teklif.olusturan_id == user.id)

    acik_durumlar = ("TASLAK", "TEKLIF_VERILDI", "BEKLEMEDE")
    acik = base.filter(Teklif.durum.in_(acik_durumlar)).count()

    bu_ay_basi = date.today().replace(day=1)
    bu_ay_kazanc = (
        base.filter(Teklif.durum == "KABUL", Teklif.kapanma_ts >= bu_ay_basi)
        .with_entities(func.coalesce(func.sum(Teklif.genel_toplam), 0))
        .scalar()
    )

    kazanma_orani = None
    kapali = base.filter(Teklif.durum.in_(("KABUL", "RED"))).count()
    if kapali > 0:
        kabul = base.filter(Teklif.durum == "KABUL").count()
        kazanma_orani = round((kabul / kapali) * 100)

    return {
        "acik_teklif_sayisi": acik,
        "bu_ay_kazanc": float(bu_ay_kazanc or 0),
        "kazanma_orani_yuzde": kazanma_orani,
    }
