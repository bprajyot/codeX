from __future__ import annotations
import requests
from flask import current_app
from typing import Any


def submit_execution(language: str, code: str, stdin: str | None, time_limit: int | None = None) -> dict[str, Any]:
	url = f"{current_app.config['EXECUTOR_URL'].rstrip('/')}/execute"
	payload = {
		"language": language,
		"code": code,
		"stdin": stdin or "",
		"time_limit_seconds": time_limit or current_app.config.get("EXECUTION_TIME_LIMIT_SECONDS", 5),
	}
	r = requests.post(url, json=payload, timeout=10)
	r.raise_for_status()
	return r.json()