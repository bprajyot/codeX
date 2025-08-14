# CodeArena Technical Specification

## 1. System Architecture

- Front-End: React (Vite), Tailwind CSS, React Query, React Router, Monaco Editor (swappable with CodeMirror). Served via Nginx in production. Talks to backend via REST; WebSocket optional for real-time updates.
- Back-End: Python Flask REST API. Auth (JWT), Problems, Submissions, Leaderboard, Matchmaking. Redis for caching, queues. SQLAlchemy for MySQL.
- Databases:
	- MySQL: users, problems, test cases, submissions metadata, matches, leaderboard snapshots.
	- Firebase Realtime Database: submission payloads (code, status, results), analytics logs.
- Executor Service: Dockerized microservice that runs code in a restricted environment with time/memory limits; communicates over HTTP with backend.
- Integrations: Redis (caching, matchmaking queue), Firebase Admin SDK.
- Networking: Nginx reverse proxy (frontend), Ingress (K8s), HTTPS via managed cert.

## 2. Database Schema (MySQL)

Tables (simplified):
- `users(id, email, username, password_hash, role, rating, created_at, updated_at)`
- `problems(id, slug, title, difficulty, is_active, description, created_at, updated_at)`
- `test_cases(id, problem_id, input, expected_output, is_public, created_at, updated_at)`
- `submissions(id, user_id, problem_id, language, status, exec_time_ms, memory_kb, firebase_key, created_at, updated_at)`
- `matches(id, status, problem_id, player_one_id, player_two_id, winner_user_id, created_at, updated_at)`
- `leaderboard_snapshots(id, snapshot_date, json_blob, created_at, updated_at)`

Indexes:
- `users.email`, `users.username` unique; `submissions(user_id, problem_id)` composite; `problems.slug` unique; `problems.difficulty`; `submissions.status`.

Relationships:
- `test_cases.problem_id -> problems.id`
- `submissions.user_id -> users.id`, `submissions.problem_id -> problems.id`
- `matches.problem_id -> problems.id`, user id FKs for players and winner

Firebase structure:
- `submissions/{submissionId}`: { user_id, problem_id, language, code, status, result }
- `analytics/events/{date}/{uuid}`: { type, ts, user_id?, metadata }

## 3. Backend API Design

Authentication: Bearer JWT in `Authorization` header.

Common errors: 4xx/5xx JSON shape `{ error: { type, message, status } }`

Endpoints:
- `POST /api/auth/register` { email, username, password } -> { access_token, user }
- `POST /api/auth/login` { email, password } -> { access_token, user }
- `GET /api/auth/me` -> { id, email, username, rating }

Problems:
- `GET /api/problems?difficulty=` -> [ { id, slug, title, difficulty } ]
- `GET /api/problems/{slug}` -> { id, slug, title, difficulty, description, public_test_cases[] }

Submissions:
- `POST /api/submissions` (auth) { problem_id, language, code, stdin? } -> { id, status, exec_time_ms, memory_kb }
- `GET /api/submissions/{id}` (auth) -> { id, status, exec_time_ms, memory_kb }

Leaderboard:
- `GET /api/leaderboard/top` -> [ { id, username, rating } ] (cached)
- `GET /api/leaderboard/snapshot/today` -> snapshot JSON or 404

Matchmaking:
- `POST /api/match/enqueue` (auth) -> { status }
- `POST /api/match/dequeue` (auth) -> { match_id, problem_id } | 202 waiting

Rate limits: fronted by API gateway or Nginx `limit_req`, Redis token bucket (future).

## 4. Frontend Component Structure

- Pages: `Home`, `ProblemDetail`, `Login`, `Register`, `Playground`.
- Components (future): `ProblemList`, `Editor`, `RunResult`, `Header`, `AuthGuard`.
- State management: React Query for server state, localStorage for token, keep Axios auth header.
- Data fetching: React Query hooks per resource; invalidation on mutation.
- UX flow: Browse problems -> open detail -> code in editor -> run -> view results.

## 5. Code Execution Environment

- Executor microservice runs code with OS-level resource limits. MVP supports Python; extendable to Node/Java/C++ with per-language build/run commands.
- Security: run as non-root, limit CPU/memory, disable networking (future with `unshare`/seccomp), timeouts, temp directories, no volumes shared.
- Communication: `POST /execute` with language, code, stdin, time_limit_seconds. Returns stdout, stderr, time_ms, memory_kb, passed.

## 6. Scalability Considerations

- Horizontal scaling: Stateless API, scale pods behind load balancer. Redis as centralized cache and queue.
- DB: MySQL with connection pooling, read replicas for analytics, proper indexes.
- Caching: Redis for leaderboards and hot lists; cache busting with TTL.
- Queues: Redis lists/streams for matchmaking and async judge tasks (future worker service).
- Executor: Run as separate pool; autoscale based on CPU. Consider job queue instead of sync calls.
- CDN: Serve static assets via CDN; cache API GETs via gateway.

## 7. Security Best Practices

- Auth: JWT with rotation/short expiry; store in httpOnly cookie or Authorization header; CSRF if cookie-based.
- Input validation: Pydantic for executor, explicit checks in API. Escape/validate problem HTML.
- Rate limiting: Nginx or gateway; Redis-based token bucket.
- Secrets: Use Kubernetes Secrets/ASM/SSM; never commit secrets.
- Database: Least privilege DB user, parameterized queries via ORM.
- Transport: Enforce HTTPS/TLS; HSTS; secure cookies.
- Headers: Nginx default security headers; CORS restricted to frontend domain.
- RCE surface: Strict sandboxing; no Docker socket in executor; non-root users; seccomp, AppArmor, read-only FS (future).

## 8. Deployment

- Cloud: AWS/GCP/Azure; managed MySQL and Redis (RDS/CloudSQL/ElastiCache).
- CI/CD: GitHub Actions builds images and pushes to GHCR/ECR/GCR. K8s deploy via ArgoCD or kubectl.
- Env vars: `.env.example` in root and per-service. Use secrets in prod.
- Monitoring: Health checks, metrics (Prometheus), logs (Loki/Cloud logs), tracing (OTel future).

## 9. Complete Codebase

- Provided in this repository:
	- Backend Flask app with blueprints, models, services, error handling
	- Executor microservice
	- Frontend React app with base pages and API integration
	- Infra for Docker Compose and Kubernetes
	- CI/CD workflow

## 10. Best Practices

- Modular service boundaries; no cross-layer coupling; service layer for integrations
- Strict typing on public APIs (add Pydantic models for requests/responses incrementally)
- Observability: add request ID, structured logging (JSON), metrics hooks
- Testing: unit tests for services and API; integration tests via docker-compose CI job
- Migrations: Alembic; treat migrations as code and review changes