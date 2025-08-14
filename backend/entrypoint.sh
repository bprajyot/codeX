#!/usr/bin/env bash
set -euo pipefail

export FLASK_APP=wsgi.py

echo "Running database migrations..."
flask db upgrade || true

echo "Starting Gunicorn..."
exec gunicorn -w ${GUNICORN_WORKERS:-2} -b 0.0.0.0:8080 wsgi:app