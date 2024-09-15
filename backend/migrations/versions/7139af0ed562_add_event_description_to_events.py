"""add event_description to events

Revision ID: 7139af0ed562
Revises: bad3bb0f329f
Create Date: 2024-09-15 13:15:54.522650

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7139af0ed562'
down_revision: Union[str, None] = 'bad3bb0f329f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('events', sa.Column('event_description', sa.Text(), nullable=True))


def downgrade() -> None:
    pass
