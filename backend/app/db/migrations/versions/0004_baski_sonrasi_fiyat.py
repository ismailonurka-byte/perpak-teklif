"""baski_sonrasi_islem tablosuna tl_m2 (sabit fiyat) kolonu

Portable (SQLite + Postgres). İlave işlemlerin (Lak, Sıvama, Dispersiyon Lak,
UV Lak, Parlak/Mat Selefon, Highloss ...) master sabit fiyatı (TL/m²).

Revision ID: 0004
Revises: 0003
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0004"
down_revision: Union[str, None] = "0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "baski_sonrasi_islem",
        sa.Column("tl_m2", sa.Numeric(8, 3), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_column("baski_sonrasi_islem", "tl_m2")
