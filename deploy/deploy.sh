#!/usr/bin/env bash
# Met le site à jour avec la dernière version de GitHub et relance les conteneurs.
# Lancé à la main ou automatiquement par GitHub Actions (workflow deploy.yml).
set -euo pipefail
cd "$(dirname "$0")/.."

COMPOSE="docker compose -f docker-compose.yml -f deploy/docker-compose.server.yml"

echo "==> Récupération du code"
git fetch --quiet origin main
git reset --hard --quiet origin/main
echo "Version : $(git log -1 --format='%h %s')"

echo "==> Construction et démarrage"
$COMPOSE up -d --build --wait --wait-timeout 300

echo "==> Nettoyage des anciennes images"
docker image prune -f >/dev/null

$COMPOSE ps
