from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.deps import DbSession, require_satis_or_admin
from app.db.models import Firma, Kullanici
from app.schemas.firma import FirmaCreate, FirmaOut, FirmaUpdate

router = APIRouter()


@router.get("", response_model=list[FirmaOut])
def liste(
    db: DbSession,
    _: Kullanici = Depends(require_satis_or_admin),
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
def detay(firma_id: UUID, db: DbSession, _: Kullanici = Depends(require_satis_or_admin)):
    f = db.query(Firma).filter(Firma.id == firma_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Firma bulunamadı")
    return f


@router.post("", response_model=FirmaOut, status_code=201)
def olustur(payload: FirmaCreate, db: DbSession, _: Kullanici = Depends(require_satis_or_admin)):
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
    _: Kullanici = Depends(require_satis_or_admin),
):
    f = db.query(Firma).filter(Firma.id == firma_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Firma bulunamadı")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(f, k, v)
    db.commit()
    db.refresh(f)
    return f
