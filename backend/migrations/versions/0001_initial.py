"""initial schema

Revision ID: 0001_initial
Revises: 
Create Date: 2025-08-14 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
	op.create_table(
		'users',
		sa.Column('id', sa.Integer(), primary_key=True),
		sa.Column('email', sa.String(length=255), nullable=False),
		sa.Column('username', sa.String(length=64), nullable=False),
		sa.Column('password_hash', sa.String(length=255), nullable=False),
		sa.Column('role', sa.String(length=32), nullable=False, server_default='user'),
		sa.Column('rating', sa.Integer(), nullable=False, server_default='1500'),
		sa.Column('created_at', sa.DateTime(), nullable=False),
		sa.Column('updated_at', sa.DateTime(), nullable=False),
		mysql_engine='InnoDB'
	)
	op.create_index('ix_users_email', 'users', ['email'], unique=True)
	op.create_index('ix_users_username', 'users', ['username'], unique=True)

	op.create_table(
		'problems',
		sa.Column('id', sa.Integer(), primary_key=True),
		sa.Column('slug', sa.String(length=128), nullable=False),
		sa.Column('title', sa.String(length=255), nullable=False),
		sa.Column('difficulty', sa.String(length=16), nullable=False),
		sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('1')),
		sa.Column('description', sa.Text(), nullable=False),
		sa.Column('created_at', sa.DateTime(), nullable=False),
		sa.Column('updated_at', sa.DateTime(), nullable=False),
		mysql_engine='InnoDB'
	)
	op.create_index('ix_problems_slug', 'problems', ['slug'], unique=True)
	op.create_index('ix_problems_difficulty', 'problems', ['difficulty'], unique=False)

	op.create_table(
		'test_cases',
		sa.Column('id', sa.Integer(), primary_key=True),
		sa.Column('problem_id', sa.Integer(), sa.ForeignKey('problems.id'), nullable=False),
		sa.Column('input', sa.Text(), nullable=False),
		sa.Column('expected_output', sa.Text(), nullable=False),
		sa.Column('is_public', sa.Boolean(), nullable=False, server_default=sa.text('0')),
		sa.Column('created_at', sa.DateTime(), nullable=False),
		sa.Column('updated_at', sa.DateTime(), nullable=False),
		mysql_engine='InnoDB'
	)
	op.create_index('ix_test_cases_problem_id', 'test_cases', ['problem_id'], unique=False)

	op.create_table(
		'submissions',
		sa.Column('id', sa.Integer(), primary_key=True),
		sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
		sa.Column('problem_id', sa.Integer(), sa.ForeignKey('problems.id'), nullable=False),
		sa.Column('language', sa.String(length=32), nullable=False),
		sa.Column('status', sa.String(length=32), nullable=False),
		sa.Column('exec_time_ms', sa.Integer(), nullable=True),
		sa.Column('memory_kb', sa.Integer(), nullable=True),
		sa.Column('firebase_key', sa.String(length=128), nullable=True),
		sa.Column('created_at', sa.DateTime(), nullable=False),
		sa.Column('updated_at', sa.DateTime(), nullable=False),
		mysql_engine='InnoDB'
	)
	op.create_index('ix_submissions_user_id', 'submissions', ['user_id'], unique=False)
	op.create_index('ix_submissions_problem_id', 'submissions', ['problem_id'], unique=False)
	op.create_index('ix_submissions_status', 'submissions', ['status'], unique=False)
	op.create_index('ix_submissions_firebase_key', 'submissions', ['firebase_key'], unique=False)
	op.create_index('ix_submission_user_problem', 'submissions', ['user_id', 'problem_id'], unique=False)

	op.create_table(
		'matches',
		sa.Column('id', sa.Integer(), primary_key=True),
		sa.Column('status', sa.String(length=32), nullable=False, server_default='waiting'),
		sa.Column('problem_id', sa.Integer(), sa.ForeignKey('problems.id'), nullable=False),
		sa.Column('player_one_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
		sa.Column('player_two_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
		sa.Column('winner_user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
		sa.Column('created_at', sa.DateTime(), nullable=False),
		sa.Column('updated_at', sa.DateTime(), nullable=False),
		mysql_engine='InnoDB'
	)
	op.create_index('ix_matches_status', 'matches', ['status'], unique=False)
	op.create_index('ix_matches_problem_id', 'matches', ['problem_id'], unique=False)
	op.create_index('ix_matches_player_one_id', 'matches', ['player_one_id'], unique=False)
	op.create_index('ix_matches_player_two_id', 'matches', ['player_two_id'], unique=False)

	op.create_table(
		'leaderboard_snapshots',
		sa.Column('id', sa.Integer(), primary_key=True),
		sa.Column('snapshot_date', sa.Date(), nullable=False, unique=True),
		sa.Column('json_blob', sa.JSON(), nullable=False),
		sa.Column('created_at', sa.DateTime(), nullable=False),
		sa.Column('updated_at', sa.DateTime(), nullable=False),
		mysql_engine='InnoDB'
	)


def downgrade() -> None:
	op.drop_table('leaderboard_snapshots')
	op.drop_index('ix_matches_player_two_id', table_name='matches')
	op.drop_index('ix_matches_player_one_id', table_name='matches')
	op.drop_index('ix_matches_problem_id', table_name='matches')
	op.drop_index('ix_matches_status', table_name='matches')
	op.drop_table('matches')
	op.drop_index('ix_submission_user_problem', table_name='submissions')
	op.drop_index('ix_submissions_firebase_key', table_name='submissions')
	op.drop_index('ix_submissions_status', table_name='submissions')
	op.drop_index('ix_submissions_problem_id', table_name='submissions')
	op.drop_index('ix_submissions_user_id', table_name='submissions')
	op.drop_table('submissions')
	op.drop_index('ix_test_cases_problem_id', table_name='test_cases')
	op.drop_table('test_cases')
	op.drop_index('ix_problems_difficulty', table_name='problems')
	op.drop_index('ix_problems_slug', table_name='problems')
	op.drop_table('problems')
	op.drop_index('ix_users_username', table_name='users')
	op.drop_index('ix_users_email', table_name='users')
	op.drop_table('users')