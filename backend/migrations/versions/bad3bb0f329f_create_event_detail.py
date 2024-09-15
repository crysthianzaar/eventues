"""create event_detail

Revision ID: bad3bb0f329f
Revises: 34f22eb31d93
Create Date: 2024-09-15 12:57:23.057997

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = 'bad3bb0f329f'
down_revision: Union[str, None] = '34f22eb31d93'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('events', sa.Column('address_detail', sa.String(length=255), nullable=True))

def downgrade() -> None:
   pass