"""initial schema — portable (works on Postgres and SQLite)

Revision ID: 0001
Revises:
Create Date: 2026-05-21
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ─── KULLANICI ──────────────────────────────────────────────────────
    op.create_table(
        "kullanici",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column("kullanici_adi", sa.String(50), nullable=False, unique=True),
        sa.Column("sifre_hash", sa.String(255), nullable=False),
        sa.Column("ad_soyad", sa.String(120), nullable=False),
        sa.Column("rol", sa.String(20), nullable=False),
        sa.Column("telefon", sa.String(30)),
        sa.Column("email", sa.String(120)),
        sa.Column("aktif", sa.Boolean, nullable=False, server_default=sa.text("1")),
        sa.Column("son_giris", sa.DateTime(timezone=True)),
        sa.Column("olusturma_ts", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_kullanici_kullanici_adi", "kullanici", ["kullanici_adi"])

    # ─── FİRMA ──────────────────────────────────────────────────────────
    op.create_table(
        "firma",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column("ad", sa.String(200), nullable=False),
        sa.Column("yetkili", sa.String(120)),
        sa.Column("telefon", sa.String(30)),
        sa.Column("email", sa.String(120)),
        sa.Column("adres", sa.Text),
        sa.Column("vergi_no", sa.String(20)),
        sa.Column("vergi_dairesi", sa.String(100)),
        sa.Column("notlar", sa.Text),
        sa.Column("aktif", sa.Boolean, server_default=sa.text("1")),
        sa.Column("olusturma_ts", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_firma_ad", "firma", ["ad"])

    # ─── MASTER TABLOLAR ────────────────────────────────────────────────
    op.create_table(
        "karton_cinsi",
        sa.Column("kod", sa.String(30), primary_key=True),
        sa.Column("ad", sa.String(80), nullable=False),
        sa.Column("aktif", sa.Boolean, server_default=sa.text("1")),
        sa.Column("sira", sa.Integer, server_default=sa.text("0")),
    )
    op.create_table(
        "gramaj",
        sa.Column("deger", sa.Integer, primary_key=True),
        sa.Column("aktif", sa.Boolean, server_default=sa.text("1")),
    )
    op.create_table(
        "oluklu_kalite",
        sa.Column("kod", sa.String(60), primary_key=True),
        sa.Column("tip", sa.String(10), nullable=False),
        sa.Column("aciklama", sa.String(120)),
        sa.Column("aktif", sa.Boolean, server_default=sa.text("1")),
    )
    op.create_table(
        "baski_turu",
        sa.Column("kod", sa.String(30), primary_key=True),
        sa.Column("ad", sa.String(60), nullable=False),
        sa.Column("aktif", sa.Boolean, server_default=sa.text("1")),
    )
    op.create_table(
        "renk",
        sa.Column("kod", sa.String(30), primary_key=True),
        sa.Column("ad", sa.String(60), nullable=False),
        sa.Column("hex_kod", sa.String(7)),
        sa.Column("aktif", sa.Boolean, server_default=sa.text("1")),
    )
    op.create_table(
        "baski_sonrasi_islem",
        sa.Column("kod", sa.String(40), primary_key=True),
        sa.Column("ad", sa.String(80), nullable=False),
        sa.Column("aktif", sa.Boolean, server_default=sa.text("1")),
    )
    op.create_table(
        "eklenti",
        sa.Column("kod", sa.String(30), primary_key=True),
        sa.Column("ad", sa.String(60), nullable=False),
        sa.Column("aktif", sa.Boolean, server_default=sa.text("1")),
    )
    op.create_table(
        "ambalaj_sekli",
        sa.Column("kod", sa.String(40), primary_key=True),
        sa.Column("ad", sa.String(80), nullable=False),
        sa.Column("aktif", sa.Boolean, server_default=sa.text("1")),
    )
    op.create_table(
        "grafik_durumu",
        sa.Column("kod", sa.String(40), primary_key=True),
        sa.Column("ad", sa.String(100), nullable=False),
        sa.Column("aktif", sa.Boolean, server_default=sa.text("1")),
    )

    op.create_table(
        "birim_fiyat_ofset",
        sa.Column("gramaj", sa.Integer, primary_key=True),
        sa.Column("baski_tl", sa.Numeric(10, 2), nullable=False),
    )
    op.create_table(
        "gecis_carpan",
        sa.Column("renk_sayisi", sa.Integer, primary_key=True),
        sa.Column("carpan", sa.Numeric(6, 3), nullable=False),
    )
    op.create_table(
        "birim_fiyat_genel",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("lak_tl_m2", sa.Numeric(8, 3)),
        sa.Column("sivama_tl_m2", sa.Numeric(8, 3)),
        sa.Column("kesim_tl", sa.Numeric(8, 3)),
        sa.Column("yapistirma_tl_ad", sa.Numeric(8, 3)),
        sa.Column("flekso_baski_kesim_tl", sa.Numeric(8, 3)),
        sa.Column("flekso_kesim_tl", sa.Numeric(8, 3)),
        sa.Column("flekso_yapistirma_tl_ad", sa.Numeric(8, 3)),
        sa.Column("koli_dikis_birim_tl", sa.Numeric(8, 3)),
        sa.Column("guncelleme_ts", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "kalem_tipi",
        sa.Column("kod", sa.String(30), primary_key=True),
        sa.Column("ad", sa.String(80), nullable=False),
        sa.Column("aciklama", sa.Text),
        sa.Column("aktif", sa.Boolean, server_default=sa.text("1")),
        sa.Column("alan_semasi", sa.JSON, nullable=False),
        sa.Column("hesaplama_fn", sa.String(60), nullable=False),
        sa.Column("sira", sa.Integer, server_default=sa.text("0")),
    )

    # ─── TEKLİF ─────────────────────────────────────────────────────────
    op.create_table(
        "teklif",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column("teklif_no", sa.String(30), nullable=False, unique=True),
        sa.Column("firma_id", sa.Uuid, sa.ForeignKey("firma.id"), nullable=False),
        sa.Column("olusturan_id", sa.Uuid, sa.ForeignKey("kullanici.id"), nullable=False),
        sa.Column("atanan_id", sa.Uuid, sa.ForeignKey("kullanici.id"), nullable=False),
        sa.Column("yetkili", sa.String(120)),
        sa.Column("tarih", sa.Date, nullable=False),
        sa.Column("gecerlilik", sa.Date),
        sa.Column("vade_metni", sa.String(50)),
        sa.Column("sevk_yeri", sa.Text),
        sa.Column("kdv_orani", sa.Numeric(4, 3), server_default=sa.text("0.200")),
        sa.Column("ara_toplam", sa.Numeric(14, 2), server_default=sa.text("0")),
        sa.Column("kdv_tutari", sa.Numeric(14, 2), server_default=sa.text("0")),
        sa.Column("genel_toplam", sa.Numeric(14, 2), server_default=sa.text("0")),
        sa.Column("notlar", sa.Text),
        sa.Column("durum", sa.String(20), nullable=False, server_default=sa.text("'TASLAK'")),
        sa.Column("durum_aciklama", sa.Text),
        sa.Column("olusturma_ts", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("guncelleme_ts", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("son_aktivite_ts", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("kapanma_ts", sa.DateTime(timezone=True)),
    )
    op.create_index("ix_teklif_teklif_no", "teklif", ["teklif_no"])
    op.create_index("ix_teklif_durum", "teklif", ["durum"])
    op.create_index("ix_teklif_son_aktivite_ts", "teklif", ["son_aktivite_ts"])
    op.create_index("ix_teklif_olusturan_durum", "teklif", ["olusturan_id", "durum"])

    op.create_table(
        "teklif_kalem",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column("teklif_id", sa.Uuid, sa.ForeignKey("teklif.id", ondelete="CASCADE"), nullable=False),
        sa.Column("sira_no", sa.Integer, nullable=False),
        sa.Column("kalem_tipi", sa.String(30), sa.ForeignKey("kalem_tipi.kod"), nullable=False),
        sa.Column("urun_ismi", sa.String(200), nullable=False),
        sa.Column("adet", sa.Integer, nullable=False),
        sa.Column("birim_fiyat", sa.Numeric(12, 4), nullable=False),
        sa.Column("toplam", sa.Numeric(14, 2), nullable=False),
        sa.Column("termin", sa.Date),
        sa.Column("spesifikasyon", sa.JSON),
        sa.Column("hesap_detayi", sa.JSON),
        sa.Column("notlar", sa.Text),
        sa.UniqueConstraint("teklif_id", "sira_no", name="uq_teklif_sira"),
    )
    op.create_index("ix_teklif_kalem_teklif_id", "teklif_kalem", ["teklif_id"])

    op.create_table(
        "teklif_durum_log",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column("teklif_id", sa.Uuid, sa.ForeignKey("teklif.id", ondelete="CASCADE"), nullable=False),
        sa.Column("eski_durum", sa.String(20)),
        sa.Column("yeni_durum", sa.String(20), nullable=False),
        sa.Column("degistiren_id", sa.Uuid, sa.ForeignKey("kullanici.id"), nullable=False),
        sa.Column("aciklama", sa.Text),
        sa.Column("ts", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_teklif_durum_log_teklif_id", "teklif_durum_log", ["teklif_id"])


def downgrade() -> None:
    for tbl in [
        "teklif_durum_log", "teklif_kalem", "teklif", "kalem_tipi",
        "birim_fiyat_genel", "gecis_carpan", "birim_fiyat_ofset",
        "grafik_durumu", "ambalaj_sekli", "eklenti", "baski_sonrasi_islem",
        "renk", "baski_turu", "oluklu_kalite", "gramaj", "karton_cinsi",
        "firma", "kullanici",
    ]:
        op.drop_table(tbl)
