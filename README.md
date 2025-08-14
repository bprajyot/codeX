# CodeArena: Online Coding Challenge Platform

A production-grade, containerized coding platform inspired by LeetCode. Stack: React + Tailwind + Monaco (front-end), Flask + Redis (back-end), MySQL (primary DB), Firebase Realtime Database (submissions/analytics), Docker-based executor microservice for sandboxed code execution.

## Repo structure

```
backend/        # Flask API + business logic + Alembic migrations
executor/       # Sandboxed code-run microservice
frontend/       # React (Vite) + Tailwind UI
infra/          # Docker Compose, Kubernetes manifests, Nginx
.github/        # GitHub Actions CI/CD
```

## Quick start (Docker Compose)

1. Copy envs and adjust values
```
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

2. Start services
```
docker compose -f infra/docker-compose.yml up --build
```

3. Access
- API: http://localhost:8080/api
- Frontend: http://localhost:3000

## Production
- See `infra/kubernetes/*` for manifests
- Configure container registry, `docker buildx`, and GitHub secrets for CI/CD

## Docs
- Architecture, API, schema, and ops are described in the project specification inside this repository and inline docs.