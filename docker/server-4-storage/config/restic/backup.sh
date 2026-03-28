#!/bin/bash
# ============================================================
# argux — Automated Backup Script (restic)
# Runs daily at 04:00 UTC via cron
# ============================================================
set -euo pipefail

TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
LOG_PREFIX="[argux-BACKUP $TIMESTAMP]"

echo "$LOG_PREFIX Starting backup run..."

# ── Initialize repo if needed ────────────────────────────────
restic snapshots > /dev/null 2>&1 || {
    echo "$LOG_PREFIX Initializing restic repository..."
    restic init
}

# ── Backup MinIO data ────────────────────────────────────────
echo "$LOG_PREFIX Backing up MinIO data volumes..."
restic backup /mnt/minio-data-1 /mnt/minio-data-2 /mnt/minio-data-3 /mnt/minio-data-4 \
    --tag minio --tag argux \
    --exclude "*.tmp" \
    --exclude ".minio.sys/tmp"

# ── Backup Qdrant snapshots ──────────────────────────────────
echo "$LOG_PREFIX Backing up Qdrant snapshots..."
restic backup /mnt/qdrant-snapshots \
    --tag qdrant --tag argux

# ── Retention policy ────────────────────────────────────────
echo "$LOG_PREFIX Applying retention policy..."
restic forget \
    --keep-daily 14 \
    --keep-weekly 8 \
    --keep-monthly 12 \
    --prune

# ── Verify integrity ────────────────────────────────────────
echo "$LOG_PREFIX Verifying backup integrity..."
restic check --read-data-subset=5%

echo "$LOG_PREFIX Backup completed successfully."
