from typing import Any
from pydantic import BaseModel


class HesaplamaRequest(BaseModel):
    kalem_tipi: str
    spesifikasyon: dict[str, Any]


class HesaplamaResponse(BaseModel):
    birim_maliyet: float
    birim_satis: float
    toplam_satis: float
    detay: dict[str, Any]
