"""RBAC: dinamik rol & izin tabloları (rol, izin, rol_izin, kullanici_rol)

Portable (SQLite + Postgres). Mevcut kullanici.rol kolonu geriye dönük uyum için korunur.

Revision ID: 0003
Revises: 0002
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "rol",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("ad", sa.String(length=60), nullable=False),
        sa.Column("aciklama", sa.Text(), nullable=True),
        sa.Column("sistem_rol", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("aktif", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("olusturma_ts", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("ad"),
    )
    op.create_table(
        "izin",
        sa.Column("kod", sa.String(length=60), nullable=False),
        sa.Column("gorunen_ad", sa.String(length=120), nullable=False),
        sa.Column("modul", sa.String(length=60), nullable=False),
        sa.Column("ekran", sa.String(length=80), nullable=False),
        sa.Column("aksiyon", sa.String(length=40), nullable=False),
        sa.Column("aciklama", sa.Text(), nullable=True),
        sa.Column("kapsam_destekler", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("sira", sa.Integer(), nullable=False, server_default="0"),
        sa.PrimaryKeyConstraint("kod"),
    )
    op.create_table(
        "rol_izin",
        sa.Column("rol_id", sa.Uuid(), nullable=False),
        sa.Column("izin_kod", sa.String(length=60), nullable=False),
        sa.Column("kapsam", sa.String(length=10), nullable=True),
        sa.ForeignKeyConstraint(["rol_id"], ["rol.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["izin_kod"], ["izin.kod"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("rol_id", "izin_kod"),
    )
    op.create_table(
        "kullanici_rol",
        sa.Column("kullanici_id", sa.Uuid(), nullable=False),
        sa.Column("rol_id", sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(["kullanici_id"], ["kullanici.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["rol_id"], ["rol.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("kullanici_id", "rol_id"),
    )


def downgrade() -> None:
    op.drop_table("kullanici_rol")
    op.drop_table("rol_izin")
    op.drop_table("izin")
    op.drop_table("rol")
