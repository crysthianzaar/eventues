"""Criar tabela do Formulario de Inscricao

Revision ID: f0b772aba2eb
Revises: 36e8e4ad5504
Create Date: 2024-09-25 22:34:34.522020

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = 'f0b772aba2eb'
down_revision: Union[str, None] = '36e8e4ad5504'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('form_fields',
    sa.Column('id', sa.String(length=36), nullable=False),
    sa.Column('event_id', sa.String(length=36), nullable=False),
    sa.Column('label', sa.String(length=255), nullable=False),
    sa.Column('type', sa.String(length=50), nullable=False),
    sa.Column('required', sa.Boolean(), nullable=True),
    sa.Column('include', sa.Boolean(), nullable=True),
    sa.Column('order', sa.Integer(), nullable=True),
    sa.Column('options', sa.Text(), nullable=True),
    sa.ForeignKeyConstraint(['event_id'], ['events.event_id'], ),
    sa.PrimaryKeyConstraint('id')
    )
   


def downgrade() -> None:
    pass
