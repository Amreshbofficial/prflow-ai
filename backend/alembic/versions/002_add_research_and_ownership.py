"""Add research_data, followup owner_id, ai_runs owner_id

Revision ID: 002_add_research_and_ownership
Revises: 001_initial
Create Date: 2026-09-01
"""
from alembic import op
import sqlalchemy as sa

revision = '002_add_research_and_ownership'
down_revision = '001_initial'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add research_data column to leads
    op.add_column('leads', sa.Column('research_data', sa.JSON(), nullable=True))

    # Add owner_id to followups
    op.add_column('followups', sa.Column('owner_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True))
    op.create_index('ix_followups_owner_id', 'followups', ['owner_id'])

    # Add owner_id to ai_runs
    op.add_column('ai_runs', sa.Column('owner_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True))
    op.create_index('ix_ai_runs_owner_id', 'ai_runs', ['owner_id'])


def downgrade() -> None:
    op.drop_index('ix_ai_runs_owner_id', table_name='ai_runs')
    op.drop_column('ai_runs', 'owner_id')
    op.drop_index('ix_followups_owner_id', table_name='followups')
    op.drop_column('followups', 'owner_id')
    op.drop_column('leads', 'research_data')
