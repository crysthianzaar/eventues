from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '5b73b75006ae'
down_revision: Union[str, None] = '37c74a2583f4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Criar chave estrangeira
    op.create_foreign_key('fk_events_user_id', 'events', 'users', ['user_id'], ['uuid'])


def downgrade() -> None:
    pass
