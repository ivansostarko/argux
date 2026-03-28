# argux Surveillance Platform — Docker Infrastructure

**Document:** ARCH-DOC-2026-006 · Rev 6.0
**Classification:** CONFIDENTIAL
**Scale Target:** 1,000,000+ records/day · 5-Server On-Premise Cluster

---

## Server Topology

| Server | Name             | Compose File                              | Purpose                          |
|--------|------------------|-------------------------------------------|----------------------------------|
| 1      | App Server       | `server-1-app/docker-compose.yml`         | Backend, Cache, Security, Proxy  |
| 2      | DB + MSG Server  | `server-2-dbmsg/docker-compose.yml`       | All Databases, Kafka, Typesense  |
| 3      | AI Server        | `server-3-ai/docker-compose.yml`          | GPU Inference, Ollama, FastAPI   |
| 4      | Storage Server   | `server-4-storage/docker-compose.yml`     | MinIO, Qdrant                    |
| 5      | Management UI    | `server-5-ui/docker-compose.yml`          | All Admin Dashboards (VPN only)  |

## Quick Start

```bash
# 1. Copy .env.example to .env on each server and fill in secrets
cp server-1-app/env/.env.example server-1-app/env/.env

# 2. Create the shared external network on each server
docker network create argux-net

# 3. Start services per server
cd server-1-app && docker compose --env-file env/.env up -d
cd server-2-dbmsg && docker compose --env-file env/.env up -d
cd server-3-ai && docker compose --env-file env/.env up -d
cd server-4-storage && docker compose --env-file env/.env up -d
cd server-5-ui && docker compose --env-file env/.env up -d
```

## Cross-Server Networking

All servers share the `argux-net` overlay network (or bridge in single-node dev).
Services resolve via internal DNS: `<service>.argux.local`
CoreDNS on Server 1 handles internal `.argux.local` zone resolution.

## Volumes

Every stateful service uses named Docker volumes with explicit driver options.
Volume names follow: `argux-<service>-<purpose>` (e.g., `argux-postgres-data`).

## Logging

All containers use the `json-file` logging driver with rotation:
- Max size: 50MB per log file
- Max files: 5 retained
- Promtail scrapes container logs and ships to Loki on Server 1.

## Backups

See `shared/scripts/` for backup cron scripts using `restic`.

## Security Notes

- All management UIs are accessible only via WireGuard VPN (Server 1)
- mTLS between all services via step-ca private CA
- No `.env` secrets committed — use Infisical in production
- All images pinned to specific versions
