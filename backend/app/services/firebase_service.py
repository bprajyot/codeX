from __future__ import annotations
import firebase_admin
from firebase_admin import credentials, db
from flask import current_app
from typing import Any, Optional


class FirebaseService:
	_initialized = False

	def init_app(self, app) -> None:
		if self._initialized:
			return
		project_id = app.config.get("FIREBASE_PROJECT_ID")
		client_email = app.config.get("FIREBASE_CLIENT_EMAIL")
		private_key = app.config.get("FIREBASE_PRIVATE_KEY")
		database_url = app.config.get("FIREBASE_DATABASE_URL")
		if not (project_id and client_email and private_key and database_url):
			return
		cred = credentials.Certificate(
			{
				"type": "service_account",
				"project_id": project_id,
				"private_key_id": "dummy",
				"private_key": private_key.replace("\\n", "\n"),
				"client_email": client_email,
				"client_id": "dummy",
				"auth_uri": "https://accounts.google.com/o/oauth2/auth",
				"token_uri": "https://oauth2.googleapis.com/token",
				"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
				"client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{client_email}",
			}
		)
		firebase_admin.initialize_app(cred, {"databaseURL": database_url})
		self._initialized = True

	def ref(self, path: str):
		return db.reference(path)

	def write_submission(self, key: str, payload: dict[str, Any]) -> None:
		self.ref(f"submissions/{key}").set(payload)

	def write_analytics(self, path: str, payload: dict[str, Any]) -> None:
		self.ref(f"analytics/{path}").push(payload)


firebase_service = FirebaseService()