from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask import current_app
import redis


db = SQLAlchemy()
migrate = Migrate()
cors = CORS()
jwt = JWTManager()


class RedisClient:
	_client = None

	def init_app(self, app):
		self._client = redis.Redis(
			host=app.config["REDIS_HOST"],
			port=app.config["REDIS_PORT"],
			db=app.config.get("REDIS_DB", 0),
			decode_responses=True,
		)

	@property
	def client(self):
		if self._client is None:
			raise RuntimeError("Redis client not initialized")
		return self._client


redis_client = RedisClient()