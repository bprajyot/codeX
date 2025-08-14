Infrastructure overview

- Docker Compose for local development: `infra/docker-compose.yml`
- Kubernetes manifests for production: `infra/kubernetes/*`
- Nginx serves SPA in frontend container, proxies /api to backend

Deployment steps (high-level)

1. Build and push images via CI/CD to container registry
2. Create Kubernetes Secrets `codearena-secrets` for DB creds, JWT secret, Firebase keys
3. Apply manifests for MySQL/Redis (managed services recommended), then backend/executor/frontend
4. Configure Ingress Controller and DNS
5. Set up monitoring and logs (Cloud provider or Prometheus/Grafana, Loki)