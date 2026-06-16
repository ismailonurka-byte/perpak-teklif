"""SQLAlchemy modeller — tüm tablolar tek dosyada (görece küçük şema)."""
from __future__ import annotations

import uuid
from datetime import datetime, date
from decimal import Decimal

from sqlalchemy import (
    JSON, Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String, Text,
    UniqueConstraint, Uuid, func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


# ─────────────────────────────────────────────────────────────────────────────
# KULLANICI
# ─────────────────────────────────────────────────────────────────────────────

class Kullanici(Base):
    __tablename__ = "kullanici"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    kullanici_adi: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    sifre_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    ad_soyad: Mapped[str] = mapped_column(String(120), nullable=False)
    unvan: Mapped[str | None] = mapped_column(String(80))  # örn: "Satış Temsilcisi", "Genel Müdür"
    rol: Mapped[str] = mapped_column(String(20), nullable=False)  # ADMIN/SATIS/URETIM
    telefon: Mapped[str | None] = mapped_column(String(30))
    email: Mapped[str | None] = mapped_column(String(120))
    aktif: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    son_giris: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    olusturma_ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


# ─────────────────────────────────────────────────────────────────────────────
# MÜŞTERİ (FİRMA)
# ─────────────────────────────────────────────────────────────────────────────

class Firma(Base):
    __tablename__ = "firma"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    ad: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    yetkili: Mapped[str | None] = mapped_column(String(120))
    telefon: Mapped[str | None] = mapped_column(String(30))
    email: Mapped[str | None] = mapped_column(String(120))
    adres: Mapped[str | None] = mapped_column(Text)
    vergi_no: Mapped[str | None] = mapped_column(String(20))
    vergi_dairesi: Mapped[str | None] = mapped_column(String(100))
    notlar: Mapped[str | None] = mapped_column(Text)
    aktif: Mapped[bool] = mapped_column(Boolean, default=True)
    olusturma_ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


# ─────────────────────────────────────────────────────────────────────────────
# MASTER (LOOKUP) TABLOLAR — Excel veri sözlüğünden taşınır
# ─────────────────────────────────────────────────────────────────────────────

class KartonCinsi(Base):
    __tablename__ = "karton_cinsi"
    kod: Mapped[str] = mapped_column(String(30), primary_key=True)  # KROMA, BRISTOL...
    ad: Mapped[str] = mapped_column(String(80), nullable=False)
    aktif: Mapped[bool] = mapped_column(Boolean, default=True)
    sira: Mapped[int] = mapped_column(Integer, default=0)


class Gramaj(Base):
    __tablename__ = "gramaj"
    deger: Mapped[int] = mapped_column(Integer, primary_key=True)  # 160, 180, 200...
    aktif: Mapped[bool] = mapped_column(Boolean, default=True)


class OlukluKalite(Base):
    __tablename__ = "oluklu_kalite"
    kod: Mapped[str] = mapped_column(String(60), primary_key=True)  # "B120/S080/T090 - B"
    tip: Mapped[str] = mapped_column(String(10), nullable=False)  # B, C, E, BC, EB
    aciklama: Mapped[str | None] = mapped_column(String(120))
    aktif: Mapped[bool] = mapped_column(Boolean, default=True)


class BaskiTuru(Base):
    """Ofset baskı makinesi tanımı. (Eski adı 'baskı türü'.)"""
    __tablename__ = "baski_turu"
    kod: Mapped[str] = mapped_column(String(30), primary_key=True)  # ROLAND_700, ROLAND_800...
    ad: Mapped[str] = mapped_column(String(60), nullable=False)
    # DAHILI (kendi makinemiz) | FASON (dış matbaa) — sadece bilgi amaçlı
    tip: Mapped[str] = mapped_column(String(10), default="DAHILI", server_default="DAHILI", nullable=False)
    # Makine bazlı varsayılanlar — teklifte otomatik dolar, orada düzenlenebilir (formül aynı kalır)
    baski_kalip_tl: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0, server_default="0", nullable=False)
    gecis_carpan: Mapped[Decimal] = mapped_column(Numeric(6, 3), default=0, server_default="0", nullable=False)
    aktif: Mapped[bool] = mapped_column(Boolean, default=True)


class Renk(Base):
    __tablename__ = "renk"
    kod: Mapped[str] = mapped_column(String(30), primary_key=True)
    ad: Mapped[str] = mapped_column(String(60), nullable=False)
    hex_kod: Mapped[str | None] = mapped_column(String(7))  # UI'da renk göstermek için
    aktif: Mapped[bool] = mapped_column(Boolean, default=True)


class BaskiSonrasi(Base):
    __tablename__ = "baski_sonrasi_islem"
    kod: Mapped[str] = mapped_column(String(40), primary_key=True)
    ad: Mapped[str] = mapped_column(String(80), nullable=False)
    # Master sabit fiyat (TL/m²) — teklifte otomatik dolar, orada düzenlenebilir.
    tl_m2: Mapped[Decimal] = mapped_column(Numeric(8, 3), default=0, server_default="0", nullable=False)
    aktif: Mapped[bool] = mapped_column(Boolean, default=True)


class Eklenti(Base):
    __tablename__ = "eklenti"
    kod: Mapped[str] = mapped_column(String(30), primary_key=True)  # KILITLI, YAPISTIRMA, DIKIS
    ad: Mapped[str] = mapped_column(String(60), nullable=False)
    aktif: Mapped[bool] = mapped_column(Boolean, default=True)


class AmbalajSekli(Base):
    __tablename__ = "ambalaj_sekli"
    kod: Mapped[str] = mapped_column(String(40), primary_key=True)
    ad: Mapped[str] = mapped_column(String(80), nullable=False)
    aktif: Mapped[bool] = mapped_column(Boolean, default=True)


class GrafikDurumu(Base):
    __tablename__ = "grafik_durumu"
    kod: Mapped[str] = mapped_column(String(40), primary_key=True)
    ad: Mapped[str] = mapped_column(String(100), nullable=False)
    aktif: Mapped[bool] = mapped_column(Boolean, default=True)


# ─────────────────────────────────────────────────────────────────────────────
# BİRİM FİYAT TABLOSU — HESAPLAMA VERİ DOSYASI'nın DB karşılığı
# ─────────────────────────────────────────────────────────────────────────────

class BirimFiyatOfset(Base):
    """OFSET baskı için gramaja bağlı birim fiyatlar."""
    __tablename__ = "birim_fiyat_ofset"
    gramaj: Mapped[int] = mapped_column(Integer, primary_key=True)
    baski_tl: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)


class GecisCarpan(Base):
    """Renk sayısına göre ek geçiş çarpanı."""
    __tablename__ = "gecis_carpan"
    renk_sayisi: Mapped[int] = mapped_column(Integer, primary_key=True)
    carpan: Mapped[Decimal] = mapped_column(Numeric(6, 3), nullable=False)


class BirimFiyatGenel(Base):
    """Lak, sıvama, kesim, yapıştırma, flekso vb. birim fiyatlar (tek satır kayıt)."""
    __tablename__ = "birim_fiyat_genel"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    lak_tl_m2: Mapped[Decimal] = mapped_column(Numeric(8, 3))
    sivama_tl_m2: Mapped[Decimal] = mapped_column(Numeric(8, 3))
    kesim_tl: Mapped[Decimal] = mapped_column(Numeric(8, 3))
    yapistirma_tl_ad: Mapped[Decimal] = mapped_column(Numeric(8, 3))
    flekso_baski_kesim_tl: Mapped[Decimal] = mapped_column(Numeric(8, 3))
    flekso_kesim_tl: Mapped[Decimal] = mapped_column(Numeric(8, 3))
    flekso_yapistirma_tl_ad: Mapped[Decimal] = mapped_column(Numeric(8, 3))
    koli_dikis_birim_tl: Mapped[Decimal] = mapped_column(Numeric(8, 3))
    guncelleme_ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


# ─────────────────────────────────────────────────────────────────────────────
# KALEM TİPİ REGISTRY (extensible)
# ─────────────────────────────────────────────────────────────────────────────

class KalemTipi(Base):
    __tablename__ = "kalem_tipi"
    kod: Mapped[str] = mapped_column(String(30), primary_key=True)  # KUTU_OFSET...
    ad: Mapped[str] = mapped_column(String(80), nullable=False)
    aciklama: Mapped[str | None] = mapped_column(Text)
    aktif: Mapped[bool] = mapped_column(Boolean, default=True)
    alan_semasi: Mapped[dict] = mapped_column(JSON, nullable=False)  # UI form şeması
    hesaplama_fn: Mapped[str] = mapped_column(String(60), nullable=False)
    sira: Mapped[int] = mapped_column(Integer, default=0)


# ─────────────────────────────────────────────────────────────────────────────
# TEKLİF
# ─────────────────────────────────────────────────────────────────────────────

class Teklif(Base):
    __tablename__ = "teklif"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    teklif_no: Mapped[str] = mapped_column(String(30), unique=True, nullable=False, index=True)

    firma_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("firma.id"), nullable=False)
    olusturan_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("kullanici.id"), nullable=False)
    atanan_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("kullanici.id"), nullable=False)

    yetkili: Mapped[str | None] = mapped_column(String(120))
    tarih: Mapped[date] = mapped_column(Date, nullable=False)
    gecerlilik: Mapped[date | None] = mapped_column(Date)
    vade_metni: Mapped[str | None] = mapped_column(String(50))
    sevk_yeri: Mapped[str | None] = mapped_column(Text)

    kdv_orani: Mapped[Decimal] = mapped_column(Numeric(4, 3), default=Decimal("0.200"))
    ara_toplam: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    kdv_tutari: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    genel_toplam: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)

    notlar: Mapped[str | None] = mapped_column(Text)
    durum: Mapped[str] = mapped_column(String(20), default="TASLAK", nullable=False, index=True)
    durum_aciklama: Mapped[str | None] = mapped_column(Text)

    olusturma_ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    guncelleme_ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    son_aktivite_ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    kapanma_ts: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    firma: Mapped["Firma"] = relationship(foreign_keys=[firma_id])
    olusturan: Mapped["Kullanici"] = relationship(foreign_keys=[olusturan_id])
    atanan: Mapped["Kullanici"] = relationship(foreign_keys=[atanan_id])
    kalemler: Mapped[list["TeklifKalem"]] = relationship(back_populates="teklif", cascade="all, delete-orphan")


class TeklifKalem(Base):
    __tablename__ = "teklif_kalem"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    teklif_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("teklif.id", ondelete="CASCADE"), nullable=False, index=True)
    sira_no: Mapped[int] = mapped_column(Integer, nullable=False)

    kalem_tipi: Mapped[str] = mapped_column(String(30), ForeignKey("kalem_tipi.kod"), nullable=False)
    urun_ismi: Mapped[str] = mapped_column(String(200), nullable=False)
    adet: Mapped[int] = mapped_column(Integer, nullable=False)
    birim_fiyat: Mapped[Decimal] = mapped_column(Numeric(12, 4), nullable=False)
    toplam: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    termin: Mapped[date | None] = mapped_column(Date)

    spesifikasyon: Mapped[dict] = mapped_column(JSON, default=dict)
    hesap_detayi: Mapped[dict] = mapped_column(JSON, default=dict)
    notlar: Mapped[str | None] = mapped_column(Text)

    teklif: Mapped["Teklif"] = relationship(back_populates="kalemler")

    __table_args__ = (
        UniqueConstraint("teklif_id", "sira_no", name="uq_teklif_sira"),
    )


class TeklifDurumLog(Base):
    __tablename__ = "teklif_durum_log"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    teklif_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("teklif.id", ondelete="CASCADE"), nullable=False, index=True)
    eski_durum: Mapped[str | None] = mapped_column(String(20))
    yeni_durum: Mapped[str] = mapped_column(String(20), nullable=False)
    degistiren_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("kullanici.id"), nullable=False)
    aciklama: Mapped[str | None] = mapped_column(Text)
    ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    degistiren: Mapped["Kullanici"] = relationship(foreign_keys=[degistiren_id])


# ─────────────────────────────────────────────────────────────────────────────
# RBAC — DİNAMİK ROL & İZİN
#   rol ──< rol_izin >── izin (katalog)      kullanici ──< kullanici_rol >── rol
#   Roller dinamik (admin oluşturur), izin kataloğu koddan gelir (permissions.py).
# ─────────────────────────────────────────────────────────────────────────────

class Rol(Base):
    __tablename__ = "rol"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    ad: Mapped[str] = mapped_column(String(60), unique=True, nullable=False)
    aciklama: Mapped[str | None] = mapped_column(Text)
    sistem_rol: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)  # korumalı (silinemez), her zaman tüm izinler
    aktif: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    olusturma_ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    izinler: Mapped[list["RolIzin"]] = relationship(back_populates="rol", cascade="all, delete-orphan")


class Izin(Base):
    """İzin kataloğu — permissions.py'den açılışta upsert edilir (admin elle oluşturmaz)."""
    __tablename__ = "izin"

    kod: Mapped[str] = mapped_column(String(60), primary_key=True)
    gorunen_ad: Mapped[str] = mapped_column(String(120), nullable=False)
    modul: Mapped[str] = mapped_column(String(60), nullable=False)
    ekran: Mapped[str] = mapped_column(String(80), nullable=False)
    aksiyon: Mapped[str] = mapped_column(String(40), nullable=False)
    aciklama: Mapped[str | None] = mapped_column(Text)
    kapsam_destekler: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sira: Mapped[int] = mapped_column(Integer, default=0)


class RolIzin(Base):
    __tablename__ = "rol_izin"

    rol_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("rol.id", ondelete="CASCADE"), primary_key=True)
    izin_kod: Mapped[str] = mapped_column(String(60), ForeignKey("izin.kod", ondelete="CASCADE"), primary_key=True)
    kapsam: Mapped[str | None] = mapped_column(String(10))  # 'own' | 'all' | None

    rol: Mapped["Rol"] = relationship(back_populates="izinler")


class KullaniciRol(Base):
    __tablename__ = "kullanici_rol"

    kullanici_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("kullanici.id", ondelete="CASCADE"), primary_key=True)
    rol_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("rol.id", ondelete="CASCADE"), primary_key=True)
