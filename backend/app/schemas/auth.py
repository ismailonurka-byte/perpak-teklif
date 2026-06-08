from pydantic import BaseModel, Field
from uuid import UUID


class LoginRequest(BaseModel):
    kullanici_adi: str = Field(min_length=2, max_length=50)
    sifre: str = Field(min_length=4, max_length=100)


class KullaniciOzet(BaseModel):
    id: UUID
    kullanici_adi: str
    ad_soyad: str
    rol: str
    email: str | None = None
    roller: list[str] = []        # atanan rol adları
    izinler: list[str] = []       # etkin izin kodları (frontend ekran/aksiyon gizleme için)

    model_config = {"from_attributes": True}


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    kullanici: KullaniciOzet


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
