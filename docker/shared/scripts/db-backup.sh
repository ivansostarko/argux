#!/bin/bash
# ============================================================
# argux — Database Backup Script
# Run on Server 2 via cron:
#   0 2 * * * /opt/argux/scripts/db-backup.sh >> /var/log/argux-backup.log 2>&1
# ============================================================
set -euo pipefail

TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="/backups/databases/$TIMESTAMP"
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting argux database backups..."

# ── PostgreSQL ───────────────────────────────────────────────
echo "[$(date)] Backing up PostgreSQL..."
docker exec argux-postgres pg_dump \
    -U argux_app \
    -d argux \
    -Fc \
    --compress=9 \
    > "$BACKUP_DIR/postgres-argux.dump"

docker exec argux-postgres pg_dump \
    -U argux_app \
    -d infisical \
    -Fc \
    --compress=9 \
    > "$BACKUP_DIR/postgres-infisical.dump"

echo "[$(date)] PostgreSQL backup: $(du -sh "$BACKUP_DIR/postgres-argux.dump" | cut -f1)"

# ── MySQL ────────────────────────────────────────────────────
echo "[$(date)] Backing up MySQL..."
docker exec argux-mysql mysqldump \
    -u root \
    -p"${MYSQL_ROOT_PASSWORD}" \
    --all-databases \
    --single-transaction \
    --quick \
    --lock-tables=false \
    | gzip > "$BACKUP_DIR/mysql-all.sql.gz"

echo "[$(date)] MySQL backup: $(du -sh "$BACKUP_DIR/mysql-all.sql.gz" | cut -f1)"

# ── ClickHouse ───────────────────────────────────────────────
echo "[$(date)] Backing up ClickHouse..."
docker exec argux-clickhouse clickhouse-client \
    --query "BACKUP DATABASE argux TO Disk('backups', 'argux-$TIMESTAMP')"

echo "[$(date)] ClickHouse backup initiated."

# ── Retention cleanup ────────────────────────────────────────
echo "[$(date)] Cleaning backups older than $RETENTION_DAYS days..."
find /backups/databases -maxdepth 1 -type d -mtime +$RETENTION_DAYS -exec rm -rf {} \;

echo "[$(date)] Database backup completed."
