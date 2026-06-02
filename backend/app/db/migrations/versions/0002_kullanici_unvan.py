"""kullanici tablosuna unvan kolonu

Revision ID: 0002
Revises: 0001
Create Date: 2026-05-22
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("kullanici", sa.Column("unvan", sa.String(80), nullable=True))


def downgrade() -> None:
    op.drop_column("kullanici", "unvan")
