# syntax=docker/dockerfile:1
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /srv

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    time \
  && rm -rf /var/lib/apt/lists/*

COPY executor/requirements.txt /srv/requirements.txt
RUN pip install -r /srv/requirements.txt

COPY executor /srv

EXPOSE 9090
CMD ["python", "main.py"]