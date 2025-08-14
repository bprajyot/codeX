import os
from datetime import timedelta


class Config:
	ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
	SECRET_KEY = os.getenv("JWT_SECRET", "dev-secret")
	SQLALCHEMY_DATABASE_URI = (
		f"mysql+pymysql://{os.getenv('MYSQL_USER','codearena')}:{os.getenv('MYSQL_PASSWORD','codearena_pass')}@"
		f"{os.getenv('MYSQL_HOST','localhost')}:{os.getenv('MYSQL_PORT','3306')}/{os.getenv('MYSQL_DATABASE','codearena')}"
	)
	SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True, "pool_size": 10, "max_overflow": 20}
	SQLALCHEMY_TRACK_MODIFICATIONS = False

	REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
	REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
	REDIS_DB = int(os.getenv("REDIS_DB", "0"))

	JWT_SECRET_KEY = SECRET_KEY
	JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=12)
	JWT_TOKEN_LOCATION = ["headers"]

	CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "*")

	EXECUTOR_URL = os.getenv("EXECUTOR_URL", "http://localhost:9090")
	EXECUTION_TIME_LIMIT_SECONDS = int(os.getenv("EXECUTION_TIME_LIMIT_SECONDS", "5"))
	EXECUTOR_CALLBACK_TOKEN = os.getenv("EXECUTOR_CALLBACK_TOKEN", "change-me")

	FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID")
	FIREBASE_CLIENT_EMAIL = os.getenv("FIREBASE_CLIENT_EMAIL")
	FIREBASE_PRIVATE_KEY = os.getenv("FIREBASE_PRIVATE_KEY")
	FIREBASE_DATABASE_URL = os.getenv("FIREBASE_DATABASE_URL")