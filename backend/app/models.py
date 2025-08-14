from datetime import datetime
from typing import Optional
from .extensions import db


class TimestampMixin:
	created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
	updated_at = db.Column(
		db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
	)


class User(db.Model, TimestampMixin):
	__tablename__ = "users"

	id = db.Column(db.Integer, primary_key=True)
	email = db.Column(db.String(255), unique=True, nullable=False, index=True)
	username = db.Column(db.String(64), unique=True, nullable=False, index=True)
	password_hash = db.Column(db.String(255), nullable=False)
	role = db.Column(db.String(32), nullable=False, default="user")
	rating = db.Column(db.Integer, nullable=False, default=1500)

	submissions = db.relationship("Submission", backref="user", lazy=True)


class Problem(db.Model, TimestampMixin):
	__tablename__ = "problems"

	id = db.Column(db.Integer, primary_key=True)
	slug = db.Column(db.String(128), unique=True, nullable=False, index=True)
	title = db.Column(db.String(255), nullable=False)
	difficulty = db.Column(db.String(16), nullable=False, index=True)
	is_active = db.Column(db.Boolean, default=True, nullable=False)
	# Markdown or HTML description stored in separate table/file in production
	description = db.Column(db.Text, nullable=False)

	test_cases = db.relationship("TestCase", backref="problem", lazy=True)
	submissions = db.relationship("Submission", backref="problem", lazy=True)


class TestCase(db.Model, TimestampMixin):
	__tablename__ = "test_cases"

	id = db.Column(db.Integer, primary_key=True)
	problem_id = db.Column(db.Integer, db.ForeignKey("problems.id"), nullable=False, index=True)
	input = db.Column(db.Text, nullable=False)
	expected_output = db.Column(db.Text, nullable=False)
	is_public = db.Column(db.Boolean, default=False, nullable=False)


class Submission(db.Model, TimestampMixin):
	__tablename__ = "submissions"

	id = db.Column(db.Integer, primary_key=True)
	user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
	problem_id = db.Column(db.Integer, db.ForeignKey("problems.id"), nullable=False, index=True)
	language = db.Column(db.String(32), nullable=False)
	status = db.Column(db.String(32), nullable=False, index=True)  # queued, running, passed, failed
	exec_time_ms = db.Column(db.Integer, nullable=True)
	memory_kb = db.Column(db.Integer, nullable=True)
	# Code is stored in Firebase; store reference key for traceability
	firebase_key = db.Column(db.String(128), nullable=True, index=True)

	__table_args__ = (
		db.Index("ix_submission_user_problem", "user_id", "problem_id"),
	)


class Match(db.Model, TimestampMixin):
	__tablename__ = "matches"

	id = db.Column(db.Integer, primary_key=True)
	status = db.Column(db.String(32), nullable=False, default="waiting", index=True)
	problem_id = db.Column(db.Integer, db.ForeignKey("problems.id"), nullable=False, index=True)
	player_one_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True)
	player_two_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True)
	winner_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)


class LeaderboardSnapshot(db.Model, TimestampMixin):
	__tablename__ = "leaderboard_snapshots"

	id = db.Column(db.Integer, primary_key=True)
	snapshot_date = db.Column(db.Date, nullable=False, unique=True)
	json_blob = db.Column(db.JSON, nullable=False)