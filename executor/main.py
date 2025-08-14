from __future__ import annotations
from flask import Flask, request, jsonify
from pydantic import BaseModel, Field
import subprocess
import tempfile
import os
import resource
import signal

app = Flask(__name__)

SUPPORTED_LANGS = {"python": {"cmd": ["python", "-u", "main.py"], "ext": ".py"}}


class ExecRequest(BaseModel):
	language: str = Field(...)
	code: str = Field(...)
	stdin: str = Field(default="")
	time_limit_seconds: int = Field(default=5, ge=1, le=15)


class ExecResult(BaseModel):
	stdout: str
	stderr: str
	time_ms: int
	memory_kb: int
	passed: bool


def set_limits():
	# Restrict CPU to prevent runaway
	resource.setrlimit(resource.RLIMIT_CPU, (2, 2))
	# Limit address space ~256MB
	resource.setrlimit(resource.RLIMIT_AS, (256 * 1024 * 1024, 256 * 1024 * 1024))
	# No core dumps
	resource.setrlimit(resource.RLIMIT_CORE, (0, 0))


@app.post("/execute")
def execute():
	data = ExecRequest(**(request.get_json() or {}))
	lang = data.language.lower()
	if lang not in SUPPORTED_LANGS:
		return jsonify({"error": {"message": f"language {lang} not supported"}}), 400

	cfg = SUPPORTED_LANGS[lang]
	with tempfile.TemporaryDirectory() as tmpdir:
		source_path = os.path.join(tmpdir, "main" + cfg["ext"])
		with open(source_path, "w") as f:
			f.write(data.code)

		proc = subprocess.Popen(
			cfg["cmd"],
			cwd=tmpdir,
			stdin=subprocess.PIPE,
			stdout=subprocess.PIPE,
			stderr=subprocess.PIPE,
			text=True,
			preexec_fn=set_limits,
		)
		try:
			stdout, stderr = proc.communicate(data.stdin, timeout=data.time_limit_seconds)
			return jsonify(ExecResult(stdout=stdout, stderr=stderr, time_ms=0, memory_kb=0, passed=(proc.returncode == 0)).model_dump())
		except subprocess.TimeoutExpired:
			proc.kill()
			return jsonify({"stdout": "", "stderr": "Time limit exceeded", "time_ms": data.time_limit_seconds * 1000, "memory_kb": 0, "passed": False})


@app.get("/healthz")
def healthz():
	return jsonify({"status": "ok"})


if __name__ == "__main__":
	app.run(host="0.0.0.0", port=9090)