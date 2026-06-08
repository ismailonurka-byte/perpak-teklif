from uuid import UUID

from pydantic import BaseModel, Field


class IzinOut(BaseModel):
    """İzin kataloğu satırı — kendini açıklayan (modül/ekran/aksiyon/amaç)."""
    kod: str
    gorunen_ad: str
    modul: str
    ekran: str
    aksiyon: str
    aciklama: str | None = None
    kapsam_destekler: bool
    sira: int

    model_config = {"from_attributes": True}


class RolIzinIn(BaseModel):
    izin_kod: str
    kapsam: str | None = None  # 'own' | 'all' | None


class RolIzinOut(BaseModel):
    izin_kod: str
    kapsam: str | None = None

    model_config = {"from_attributes": True}


class RolCreate(BaseModel):
    ad: str = Field(min_length=2, max_length=60)
    aciklama: str | None = None


class RolUpdate(BaseModel):
    ad: str | None = Field(default=None, min_length=2, max_length=60)
    aciklama: str | None = None
    aktif: bool | None = None


class RolOut(BaseModel):
    id: UUID
    ad: str
    aciklama: str | None = None
    sistem_rol: bool
    aktif: bool
    izinler: list[RolIzinOut] = []

    model_config = {"from_attributes": True}


class KullaniciRollerIn(BaseModel):
    rol_ids: list[UUID] = []
