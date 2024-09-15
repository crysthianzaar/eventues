"""create events table

Revision ID: 34f22eb31d93
Revises: 27941396bf5d
Create Date: 2024-09-15 00:03:06.146377

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = '34f22eb31d93'
down_revision: Union[str, None] = '27941396bf5d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('events', sa.Column('address', sa.String(length=255), nullable=True))
    op.add_column('events', sa.Column('address_complement', sa.String(length=255), nullable=True))


def downgrade() -> None:
    pass
