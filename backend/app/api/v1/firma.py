from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.deps import DbSession, require_permission
from app.db.models import Firma, Kullanici, Teklif
from app.schemas.firma import FirmaCreate, FirmaOut, FirmaUpdate

router = APIRouter()


@router.get("", response_model=list[FirmaOut])
def liste(
    db: DbSession,
    _: Kullanici = Depends(require_permission("firma.read")),
    q: str | None = Query(default=None),
    aktif_mi: bool = Query(default=True),
):
    qry = db.query(Firma)
    if aktif_mi:
        qry = qry.filter(Firma.aktif.is_(True))
    if q:
        like = f"%{q}%"
        qry = qry.filter(Firma.ad.ilike(like))
    return qry.order_by(Firma.ad).limit(200).all()


@router.get("/{firma_id}", response_model=FirmaOut)
def detay(firma_id: UUID, db: DbSession, _: Kullanici = Depends(require_permission("firma.read"))):
    f = db.query(Firma).filter(Firma.id == firma_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Firma bulunamadı")
    return f


@router.post("", response_model=FirmaOut, status_code=201)
def olustur(payload: FirmaCreate, db: DbSession, _: Kullanici = Depends(require_permission("firma.create"))):
    f = Firma(**payload.model_dump())
    db.add(f)
    db.commit()
    db.refresh(f)
    return f


@router.patch("/{firma_id}", response_model=FirmaOut)
def guncelle(
    firma_id: UUID,
    payload: FirmaUpdate,
    db: DbSession,
    _: Kullanici = Depends(require_permission("firma.update")),
):
    f = db.query(Firma).filter(Firma.id == firma_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Firma bulunamadı")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(f, k, v)
    db.commit()
    db.refresh(f)
    return f


@router.delete("/{firma_id}", status_code=204)
def sil(
    firma_id: UUID,
    db: DbSession,
    _: Kullanici = Depends(require_permission("firma.update")),
):
    """Müşteriyi kalıcı siler. Teklifi olan müşteri silinemez (önce pasife alınmalı)."""
    f = db.query(Firma).filter(Firma.id == firma_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Firma bulunamadı")
    teklif_var = db.query(Teklif).filter(Teklif.firma_id == firma_id).first()
    if teklif_var:
        raise HTTPException(
            status_code=400,
            detail="Bu müşterinin teklifleri var, kalıcı silinemez. Pasife alabilirsiniz.",
        )
    db.delete(f)
    db.commit()
