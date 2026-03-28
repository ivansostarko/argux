#!/bin/bash
# ============================================================
# argux — Full Cluster Deploy Script
# Usage: ./deploy.sh [server-number|all] [up|down|restart|pull|logs]
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

SERVERS=(
    "server-1-app"
    "server-2-dbmsg"
    "server-3-ai"
    "server-4-storage"
    "server-5-ui"
)

SERVER_NAMES=(
    "Application Server"
    "Database & Messaging Server"
    "AI Server (GPU)"
    "Storage Server"
    "Management UI Server"
)

# Correct startup order: Storage → DB → AI → App → UI
STARTUP_ORDER=(3 1 2 0 4)

usage() {
    echo -e "${CYAN}argux Platform Deploy Script${NC}"
    echo ""
    echo "Usage: $0 <target> <action>"
    echo ""
    echo "Targets:"
    echo "  all     - All 5 servers (ordered deploy)"
    echo "  1-5     - Specific server number"
    echo ""
    echo "Actions:"
    echo "  up      - Start services (default)"
    echo "  down    - Stop services"
    echo "  restart - Restart services"
    echo "  pull    - Pull latest images"
    echo "  logs    - Tail logs"
    echo "  status  - Show container status"
    echo "  ps      - Show running containers"
    exit 1
}

deploy_server() {
    local idx=$1
    local action=${2:-up}
    local server=${SERVERS[$idx]}
    local name=${SERVER_NAMES[$idx]}
    local compose_dir="$ROOT_DIR/$server"

    if [ ! -f "$compose_dir/docker-compose.yml" ]; then
        echo -e "${RED}ERROR: $compose_dir/docker-compose.yml not found${NC}"
        return 1
    fi

    local env_file="$compose_dir/env/.env"
    local env_flag=""
    if [ -f "$env_file" ]; then
        env_flag="--env-file $env_file"
    else
        echo -e "${YELLOW}WARNING: No .env file found at $env_file — using defaults${NC}"
    fi

    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}Server $((idx+1)): $name${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    case $action in
        up)
            docker compose -f "$compose_dir/docker-compose.yml" $env_flag up -d --remove-orphans
            ;;
        down)
            docker compose -f "$compose_dir/docker-compose.yml" $env_flag down
            ;;
        restart)
            docker compose -f "$compose_dir/docker-compose.yml" $env_flag restart
            ;;
        pull)
            docker compose -f "$compose_dir/docker-compose.yml" $env_flag pull
            ;;
        logs)
            docker compose -f "$compose_dir/docker-compose.yml" $env_flag logs -f --tail=100
            ;;
        status|ps)
            docker compose -f "$compose_dir/docker-compose.yml" $env_flag ps
            ;;
        *)
            echo -e "${RED}Unknown action: $action${NC}"
            usage
            ;;
    esac

    echo ""
}

# ── Parse arguments ──────────────────────────────────────────
TARGET=${1:-}
ACTION=${2:-up}

if [ -z "$TARGET" ]; then
    usage
fi

case $TARGET in
    all)
        echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║       argux Platform — Full Cluster $ACTION               ║${NC}"
        echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
        echo ""

        if [ "$ACTION" = "down" ]; then
            # Reverse order for shutdown
            for ((i=${#STARTUP_ORDER[@]}-1; i>=0; i--)); do
                deploy_server ${STARTUP_ORDER[$i]} "$ACTION"
            done
        else
            for idx in "${STARTUP_ORDER[@]}"; do
                deploy_server "$idx" "$ACTION"
                if [ "$ACTION" = "up" ]; then
                    echo -e "${YELLOW}Waiting 10s for services to initialize...${NC}"
                    sleep 10
                fi
            done
        fi

        echo -e "${GREEN}All servers processed.${NC}"
        ;;
    [1-5])
        deploy_server $((TARGET-1)) "$ACTION"
        ;;
    *)
        echo -e "${RED}Invalid target: $TARGET${NC}"
        usage
        ;;
esac
