# ============================================================
# argux Platform — Makefile
# ============================================================

.PHONY: help up down restart pull status logs health backup init

SHELL := /bin/bash
DEPLOY := ./shared/scripts/deploy.sh

help: ## Show this help
	@echo "argux Platform — Docker Infrastructure"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

init: ## Initialize .env files from examples
	@for dir in server-{1..5}-*/; do \
		if [ -f "$$dir/env/.env.example" ] && [ ! -f "$$dir/env/.env" ]; then \
			cp "$$dir/env/.env.example" "$$dir/env/.env"; \
			echo "Created $$dir/env/.env"; \
		fi; \
	done
	@echo "Edit each .env file with your secrets before deploying."

up: ## Start all servers (ordered)
	@chmod +x $(DEPLOY)
	@$(DEPLOY) all up

down: ## Stop all servers (reverse order)
	@chmod +x $(DEPLOY)
	@$(DEPLOY) all down

restart: ## Restart all servers
	@chmod +x $(DEPLOY)
	@$(DEPLOY) all restart

pull: ## Pull latest images for all servers
	@chmod +x $(DEPLOY)
	@$(DEPLOY) all pull

status: ## Show container status for all servers
	@chmod +x $(DEPLOY)
	@$(DEPLOY) all status

logs: ## Tail logs for all servers
	@chmod +x $(DEPLOY)
	@$(DEPLOY) all logs

health: ## Run health check across all services
	@chmod +x ./shared/scripts/health-check.sh
	@./shared/scripts/health-check.sh

backup: ## Run database backup
	@chmod +x ./shared/scripts/db-backup.sh
	@./shared/scripts/db-backup.sh

# ── Per-server targets ───────────────────────────────────────
up-app: ## Start Server 1 (App)
	@chmod +x $(DEPLOY) && $(DEPLOY) 1 up

up-db: ## Start Server 2 (DB+MSG)
	@chmod +x $(DEPLOY) && $(DEPLOY) 2 up

up-ai: ## Start Server 3 (AI)
	@chmod +x $(DEPLOY) && $(DEPLOY) 3 up

up-storage: ## Start Server 4 (Storage)
	@chmod +x $(DEPLOY) && $(DEPLOY) 4 up

up-ui: ## Start Server 5 (Management UI)
	@chmod +x $(DEPLOY) && $(DEPLOY) 5 up

down-app: ## Stop Server 1
	@chmod +x $(DEPLOY) && $(DEPLOY) 1 down

down-db: ## Stop Server 2
	@chmod +x $(DEPLOY) && $(DEPLOY) 2 down

down-ai: ## Stop Server 3
	@chmod +x $(DEPLOY) && $(DEPLOY) 3 down

down-storage: ## Stop Server 4
	@chmod +x $(DEPLOY) && $(DEPLOY) 4 down

down-ui: ## Stop Server 5
	@chmod +x $(DEPLOY) && $(DEPLOY) 5 down
