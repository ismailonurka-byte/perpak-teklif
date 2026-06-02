from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, field_validator


def _bos_ise_none(v):
    """Boş string'i None'a çevirir — UI'dan gelen '' EmailStr'i boşa kırmasın."""
    if isinstance(v, str) and v.strip() == "":
        return None
    return v


class FirmaBase(BaseModel):
    ad: str
    yetkili: str | None = None
    telefon: str | None = None
    email: EmailStr | None = None
    adres: str | None = None
    vergi_no: str | None = None
    vergi_dairesi: str | None = None
    notlar: str | None = None

    @field_validator("email", "yetkili", "telefon", "adres", "vergi_no", "vergi_dairesi", "notlar", mode="before")
    @classmethod
    def _normalize(cls, v):
        return _bos_ise_none(v)


class FirmaCreate(FirmaBase):
    pass


class FirmaUpdate(BaseModel):
    ad: str | None = None
    yetkili: str | None = None
    telefon: str | None = None
    email: EmailStr | None = None
    adres: str | None = None
    vergi_no: str | None = None
    vergi_dairesi: str | None = None
    notlar: str | None = None
    aktif: bool | None = None

    @field_validator("email", "yetkili", "telefon", "adres", "vergi_no", "vergi_dairesi", "notlar", mode="before")
    @classmethod
    def _normalize(cls, v):
        return _bos_ise_none(v)


class FirmaOut(FirmaBase):
    id: UUID
    aktif: bool
    olusturma_ts: datetime

    model_config = {"from_attributes": True}
