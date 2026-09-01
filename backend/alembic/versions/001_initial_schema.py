"""Initial schema with user ownership

Revision ID: 001_initial
Revises: 
Create Date: 2026-09-01
"""
from alembic import op
import sqlalchemy as sa

revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255), unique=True, index=True, nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('role', sa.String(50), server_default='consultant'),
        sa.Column('default_tone', sa.String(100), server_default='Professional & Direct'),
        sa.Column('default_channel', sa.String(50), server_default='Email'),
        sa.Column('email_notifications', sa.Boolean(), server_default=sa.text('true')),
        sa.Column('followup_reminders', sa.Boolean(), server_default=sa.text('true')),
        sa.Column('weekly_digest', sa.Boolean(), server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )

    op.create_table(
        'leads',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('owner_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False, index=True),
        sa.Column('company_name', sa.String(255), nullable=False),
        sa.Column('website', sa.String(255)),
        sa.Column('contact_name', sa.String(255), nullable=False),
        sa.Column('contact_email', sa.String(255)),
        sa.Column('job_title', sa.String(255)),
        sa.Column('industry', sa.String(255)),
        sa.Column('location', sa.String(255)),
        sa.Column('company_size', sa.String(50)),
        sa.Column('linkedin_url', sa.String(255)),
        sa.Column('description', sa.Text),
        sa.Column('status', sa.String(50), server_default='New'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )

    op.create_table(
        'outreach_messages',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('lead_id', sa.Integer(), sa.ForeignKey('leads.id'), nullable=False),
        sa.Column('channel', sa.String(50)),
        sa.Column('goal', sa.String(100)),
        sa.Column('tone', sa.String(50)),
        sa.Column('subject', sa.String(255)),
        sa.Column('message', sa.Text),
        sa.Column('ai_generated', sa.Boolean(), server_default=sa.text('false')),
        sa.Column('human_edited', sa.Boolean(), server_default=sa.text('false')),
        sa.Column('status', sa.String(50), server_default='Draft'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )

    op.create_table(
        'followups',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('lead_id', sa.Integer(), sa.ForeignKey('leads.id'), nullable=False),
        sa.Column('outreach_id', sa.Integer(), sa.ForeignKey('outreach_messages.id')),
        sa.Column('due_at', sa.DateTime(timezone=True)),
        sa.Column('note', sa.Text),
        sa.Column('status', sa.String(50), server_default='Pending'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('completed_at', sa.DateTime(timezone=True)),
    )

    op.create_table(
        'activities',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('lead_id', sa.Integer(), sa.ForeignKey('leads.id'), nullable=False),
        sa.Column('type', sa.String(50)),
        sa.Column('description', sa.String(255)),
        sa.Column('metadata', sa.JSON()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        'ai_runs',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('provider', sa.String(50)),
        sa.Column('model', sa.String(100)),
        sa.Column('task_type', sa.String(50)),
        sa.Column('prompt_version', sa.String(50)),
        sa.Column('input_data', sa.JSON()),
        sa.Column('output_data', sa.JSON()),
        sa.Column('validation_status', sa.String(50)),
        sa.Column('status', sa.String(50)),
        sa.Column('latency_ms', sa.Integer()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('ai_runs')
    op.drop_table('activities')
    op.drop_table('followups')
    op.drop_table('outreach_messages')
    op.drop_table('leads')
    op.drop_table('users')
