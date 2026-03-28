#!/bin/bash
# ============================================================
# argux — Cluster Health Check
# Usage: ./health-check.sh
# ============================================================
set -uo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

PASS=0
FAIL=0
WARN=0

check_service() {
    local name=$1
    local url=$2
    local timeout=${3:-5}

    if curl -sf --max-time "$timeout" "$url" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} $name"
        ((PASS++))
    else
        echo -e "  ${RED}✗${NC} $name ($url)"
        ((FAIL++))
    fi
}

check_port() {
    local name=$1
    local host=$2
    local port=$3

    if timeout 3 bash -c "echo > /dev/tcp/$host/$port" 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} $name"
        ((PASS++))
    else
        echo -e "  ${RED}✗${NC} $name ($host:$port)"
        ((FAIL++))
    fi
}

echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║          argux Platform — Health Check                  ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}Server 1 — Application:${NC}"
check_service "Nginx"          "http://localhost:80/health"
check_service "Laravel Octane" "http://localhost:8000/api/v1/health"
check_service "Prometheus"     "http://localhost:9090/-/healthy"
check_service "Grafana"        "http://localhost:3000/api/health"
check_service "Loki"           "http://localhost:3100/ready"
check_service "MediaMTX"       "http://localhost:9997/v3/paths/list"
check_port    "Redis Cluster"  "localhost" 6379
check_port    "CoreDNS"        "localhost" 53
echo ""

echo -e "${YELLOW}Server 2 — Database & Messaging:${NC}"
check_port    "PostgreSQL"     "postgres.argux.local" 5432
check_port    "MySQL"          "mysql.argux.local" 3306
check_service "ClickHouse"     "http://clickhouse.argux.local:8123/ping"
check_port    "Kafka Broker 1" "kafka-1.argux.local" 9092
check_port    "Kafka Broker 2" "kafka-2.argux.local" 9092
check_port    "Kafka Broker 3" "kafka-3.argux.local" 9092
check_service "Karapace"       "http://karapace.argux.local:8081/subjects"
check_service "Typesense"      "http://typesense-1.argux.local:8108/health"
echo ""

echo -e "${YELLOW}Server 3 — AI:${NC}"
check_service "Ollama"         "http://ollama.argux.local:11434/api/tags"
check_service "FastAPI AI"     "http://fastapi.argux.local:8001/health"
echo ""

echo -e "${YELLOW}Server 4 — Storage:${NC}"
check_service "MinIO"          "http://minio.argux.local:9000/minio/health/live"
check_service "Qdrant"         "http://qdrant.argux.local:6333/healthz"
echo ""

echo -e "${YELLOW}Server 5 — Management UI:${NC}"
check_service "pgAdmin"        "http://localhost:5050/misc/ping"
check_service "phpMyAdmin"     "http://localhost:5051"
check_service "Adminer"        "http://localhost:5052"
check_service "RedisInsight"   "http://localhost:5053/api/health"
check_service "Kafka UI"       "http://localhost:5054/actuator/health"
check_service "GlitchTip"     "http://localhost:5057/_health/"
echo ""

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  ${GREEN}Passed: $PASS${NC}  ${RED}Failed: $FAIL${NC}  ${YELLOW}Warnings: $WARN${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ $FAIL -gt 0 ]; then
    exit 1
fi
