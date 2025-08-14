from flask import Flask
from .auth import bp as auth_bp
from .problems import bp as problems_bp
from .submissions import bp as submissions_bp
from .leaderboard import bp as leaderboard_bp
from .matchmaking import bp as matchmaking_bp


def register_blueprints(app: Flask) -> None:
	app.register_blueprint(auth_bp, url_prefix="/api/auth")
	app.register_blueprint(problems_bp, url_prefix="/api/problems")
	app.register_blueprint(submissions_bp, url_prefix="/api/submissions")
	app.register_blueprint(leaderboard_bp, url_prefix="/api/leaderboard")
	app.register_blueprint(matchmaking_bp, url_prefix="/api/match")