from datetime import date, datetime
from decimal import Decimal
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.firma import FirmaOut
from app.schemas.kullanici import KullaniciOut


# ─── KALEM ───────────────────────────────────────────────────────────────

class TeklifKalemBase(BaseModel):
    sira_no: int
    kalem_tipi: str
    urun_ismi: str
    adet: int = Field(gt=0)
    birim_fiyat: Decimal
    toplam: Decimal | None = None
    termin: date | None = None
    spesifikasyon: dict[str, Any] = Field(default_factory=dict)
    hesap_detayi: dict[str, Any] = Field(default_factory=dict)
    notlar: str | None = None


class TeklifKalemCreate(TeklifKalemBase):
    pass


class TeklifKalemOut(TeklifKalemBase):
    id: UUID
    teklif_id: UUID

    model_config = {"from_attributes": True}


# ─── TEKLİF ──────────────────────────────────────────────────────────────

class TeklifBase(BaseModel):
    firma_id: UUID
    yetkili: str | None = None
    tarih: date
    gecerlilik: date | None = None
    vade_metni: str | None = None
    sevk_yeri: str | None = None
    kdv_orani: Decimal = Decimal("0.20")
    notlar: str | None = None


class TeklifCreate(TeklifBase):
    atanan_id: UUID | None = None  # boş → olusturan_id ile aynı
    kalemler: list[TeklifKalemCreate] = Field(default_factory=list)


class TeklifUpdate(BaseModel):
    firma_id: UUID | None = None
    yetkili: str | None = None
    tarih: date | None = None
    gecerlilik: date | None = None
    vade_metni: str | None = None
    sevk_yeri: str | None = None
    kdv_orani: Decimal | None = None
    notlar: str | None = None
    durum: str | None = Field(default=None, pattern="^(TASLAK|TEKLIF_VERILDI|BEKLEMEDE|KABUL|SIPARIS|RED|IPTAL)$")
    durum_aciklama: str | None = None
    atanan_id: UUID | None = None
    kalemler: list[TeklifKalemCreate] | None = None  # tam değiştirme


class TeklifListItem(BaseModel):
    id: UUID
    teklif_no: str
    firma_adi: str
    olusturan_ad: str
    tarih: date
    genel_toplam: Decimal
    durum: str
    son_aktivite_ts: datetime

    model_config = {"from_attributes": True}


class TeklifOut(TeklifBase):
    id: UUID
    teklif_no: str
    olusturan_id: UUID
    atanan_id: UUID
    ara_toplam: Decimal
    kdv_tutari: Decimal
    genel_toplam: Decimal
    durum: str
    durum_aciklama: str | None = None
    olusturma_ts: datetime
    guncelleme_ts: datetime
    son_aktivite_ts: datetime
    kapanma_ts: datetime | None = None

    firma: FirmaOut
    olusturan: KullaniciOut
    atanan: KullaniciOut
    kalemler: list[TeklifKalemOut] = Field(default_factory=list)

    model_config = {"from_attributes": True}
