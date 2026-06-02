"""Anlık fiyat önizleme endpoint'i — UI formundan her girdi değişikliğinde çağrılır."""
from fastapi import APIRouter, HTTPException

from app.core.deps import CurrentUser, DbSession
from app.schemas.hesaplama import HesaplamaRequest, HesaplamaResponse
from app.services.pricing import calculate

router = APIRouter()


@router.post("/preview", response_model=HesaplamaResponse)
def preview(payload: HesaplamaRequest, db: DbSession, _: CurrentUser):
    try:
        result = calculate(payload.kalem_tipi, payload.spesifikasyon, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Hesaplama hatası: {e}")
    return HesaplamaResponse(**result.to_dict())
