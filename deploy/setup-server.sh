#!/usr/bin/env bash
# Préparation d'une VM Ubuntu 24.04 neuve pour PinVault. À lancer UNE SEULE FOIS :
#   bash deploy/setup-server.sh
set -euo pipefail

if [[ $EUID -eq 0 ]]; then
  echo "Lance ce script avec ton utilisateur normal (il utilisera sudo quand il faut)." >&2
  exit 1
fi

echo "==> Mises à jour du système"
sudo apt-get update -y
sudo DEBIAN_FRONTEND=noninteractive apt-get upgrade -y
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y ca-certificates curl git ufw unattended-upgrades fail2ban

echo "==> Mises à jour de sécurité automatiques + blocage des attaques SSH (fail2ban)"
sudo dpkg-reconfigure -f noninteractive unattended-upgrades
sudo systemctl enable --now fail2ban

echo "==> Installation de Docker (dépôt officiel)"
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sudo sh
fi
sudo usermod -aG docker "$USER"

echo "==> Pare-feu : SSH, HTTP et HTTPS uniquement"
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp
sudo ufw --force enable

echo "==> Mémoire d'échange (2 Go) pour compiler sans manquer de RAM"
if ! swapon --show | grep -q /swapfile; then
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi

echo "==> Sauvegarde automatique chaque nuit à 3 h"
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
sudo mkdir -p /var/backups/pinvault
sudo chown "$USER" /var/backups/pinvault
( crontab -l 2>/dev/null | grep -v 'deploy/backup.sh' ; echo "0 3 * * * bash $REPO_DIR/deploy/backup.sh >> /var/backups/pinvault/backup.log 2>&1" ) | crontab -

echo
echo "Terminé. Déconnecte-toi puis reconnecte-toi (exit, puis ssh) pour pouvoir utiliser docker sans sudo."
