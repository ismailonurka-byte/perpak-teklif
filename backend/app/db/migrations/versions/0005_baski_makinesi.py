"""baski_turu (baskı makinesi) tablosuna tip + makine bazlı kalıp TL & geçiş çarpanı

Dahili/Fason bilgisi ve makine bazında baski_kalip_tl / gecis_carpan.
Portable (SQLite + Postgres).

Revision ID: 0005
Revises: 0004
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0005"
down_revision: Union[str, None] = "0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("baski_turu", sa.Column("tip", sa.String(length=10), nullable=False, server_default="DAHILI"))
    op.add_column("baski_turu", sa.Column("baski_kalip_tl", sa.Numeric(10, 2), nullable=False, server_default="0"))
    op.add_column("baski_turu", sa.Column("gecis_carpan", sa.Numeric(6, 3), nullable=False, server_default="0"))


def downgrade() -> None:
    op.drop_column("baski_turu", "gecis_carpan")
    op.drop_column("baski_turu", "baski_kalip_tl")
    op.drop_column("baski_turu", "tip")
