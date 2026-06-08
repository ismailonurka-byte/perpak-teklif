from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator


def _bos_ise_none(v):
    if isinstance(v, str) and v.strip() == "":
        return None
    return v


class KullaniciCreate(BaseModel):
    kullanici_adi: str = Field(min_length=2, max_length=50)
    sifre: str = Field(min_length=4, max_length=100)
    ad_soyad: str
    unvan: str | None = None
    rol: str = Field(pattern="^(ADMIN|SATIS|URETIM)$")
    telefon: str | None = None
    email: EmailStr | None = None

    @field_validator("email", "telefon", "unvan", mode="before")
    @classmethod
    def _normalize(cls, v):
        return _bos_ise_none(v)


class KullaniciUpdate(BaseModel):
    ad_soyad: str | None = None
    unvan: str | None = None
    rol: str | None = Field(default=None, pattern="^(ADMIN|SATIS|URETIM)$")
    telefon: str | None = None
    email: EmailStr | None = None
    aktif: bool | None = None
    sifre: str | None = Field(default=None, min_length=4)

    @field_validator("email", "telefon", "sifre", "unvan", mode="before")
    @classmethod
    def _normalize(cls, v):
        return _bos_ise_none(v)


class KullaniciOut(BaseModel):
    id: UUID
    kullanici_adi: str
    ad_soyad: str
    unvan: str | None = None
    rol: str
    roller: list[str] = []      # atanan dinamik rol adları
    telefon: str | None = None
    email: str | None = None
    aktif: bool
    son_giris: datetime | None = None
    olusturma_ts: datetime

    model_config = {"from_attributes": True}
