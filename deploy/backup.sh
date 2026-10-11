#!/usr/bin/env bash
# Sauvegarde la base PostgreSQL et les photos. Garde les 14 dernières sauvegardes.
# Lancé chaque nuit par cron (voir setup-server.sh), ou à la main : bash deploy/backup.sh
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; source .env; set +a

DEST=/var/backups/pinvault
STAMP=$(date +%Y-%m-%d_%H%M)
COMPOSE="docker compose -f docker-compose.yml -f deploy/docker-compose.server.yml"

$COMPOSE exec -T db pg_dump -U "${DB_USER:-pinvault}" -d "${DB_NAME:-pinvault}" --clean --if-exists \
  | gzip > "$DEST/db_$STAMP.sql.gz"

$COMPOSE exec -T backend tar -czf - -C /data uploads > "$DEST/uploads_$STAMP.tar.gz"

find "$DEST" -name '*.gz' -mtime +14 -delete
echo "$(date '+%F %T') sauvegarde OK : db_$STAMP.sql.gz, uploads_$STAMP.tar.gz"
