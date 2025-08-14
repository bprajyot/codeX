from flask import Flask, jsonify
from .config import Config
from .extensions import db, migrate, cors, jwt, redis_client
from .api import register_blueprints
from .errors import register_error_handlers
from .services.firebase_service import firebase_service
from .cli import init_cli


def create_app(config: type[Config] | None = None) -> Flask:
	app = Flask(__name__)
	app.config.from_object(config or Config())

	# Extensions
	db.init_app(app)
	migrate.init_app(app, db)
	cors.init_app(app, resources={r"/api/*": {"origins": app.config.get("CORS_ALLOWED_ORIGINS", "*")}})
	jwt.init_app(app)
	redis_client.init_app(app)

	# Firebase
	firebase_service.init_app(app)

	# Blueprints
	register_blueprints(app)

	# Errors
	register_error_handlers(app)

	# CLI
	init_cli(app)

	@app.get("/healthz")
	def healthz():
		return jsonify({"status": "ok"})

	return app