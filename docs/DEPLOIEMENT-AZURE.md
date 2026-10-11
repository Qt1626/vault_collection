# Déployer PinVault sur une VM Azure

Résultat : le site tourne 24h/24 sur `https://<ton-label>.francecentral.cloudapp.azure.com`, en HTTPS, avec une sauvegarde chaque nuit et une mise à jour automatique à chaque `git push` sur `main`.

```
Internet ──443──► Caddy (HTTPS) ──► frontend (Nginx) ──/api──► backend (Spring Boot) ──► db (PostgreSQL)
                  └─ seul conteneur exposé ; certificats Let's Encrypt renouvelés automatiquement
```

Durée : environ 45 minutes la première fois.

---

## Étape 0 — Pousser le projet sur GitHub

Sur ton PC, dans le dossier `disney-pins` :

```powershell
git add .
git commit -m "Pokémon, Docker, déploiement Azure"
git push
```

## Étape 1 — Vérifier les crédits Azure for Students

Dans le portail Azure ([portal.azure.com](https://portal.azure.com)), cherche **« Education »** pour voir tes crédits restants.
Avec Azure for Students, une limite de dépense est en principe active : quand les crédits sont épuisés, les ressources s'arrêtent au lieu de te facturer. Vérifie-le dans **Abonnements → ton abonnement → Vue d'ensemble**.

> Une VM allumée consomme des crédits en continu, même sans visiteur. Supprime ce que tu n'utilises plus.

## Étape 2 — Créer une clé SSH sur ton PC

Dans PowerShell :

```powershell
ssh-keygen -t ed25519 -C "pinvault-azure"
```

Appuie sur Entrée à chaque question (tu peux mettre une phrase de passe si tu veux). Affiche ensuite la clé **publique** :

```powershell
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub
```

Copie toute la ligne (elle commence par `ssh-ed25519`). La clé **privée** (`id_ed25519`, sans `.pub`) ne doit jamais être partagée.

## Étape 3 — Créer la machine virtuelle

Portail Azure → **Machines virtuelles** → **Créer** → **Machine virtuelle Azure**.

| Onglet | Champ | Valeur |
|---|---|---|
| Base | Groupe de ressources | Créer : `pinvault-rg` |
| | Nom | `pinvault-vm` |
| | Région | **France Central**. Si elle est refusée (certains abonnements étudiants limitent les régions), prends une autre région européenne proposée |
| | Options de disponibilité | Aucune redondance d'infrastructure requise |
| | Image | **Ubuntu Server 24.04 LTS – x64 Gen2** |
| | Taille | **B2s** (2 vCPU, 4 Go). Sinon une autre série B avec 4 Go, ex. B2als_v2 |
| | Type d'authentification | **Clé publique SSH** |
| | Nom d'utilisateur | `azureuser` |
| | Source de clé publique | Utiliser une clé publique existante → colle ta clé de l'étape 2 |
| | Ports d'entrée publics | **SSH (22), HTTP (80), HTTPS (443)** |
| Disques | Type de disque | SSD Standard, 30 Go |
| Gestion | Arrêt automatique | **Désactivé** (sinon le site s'éteint chaque soir) |

**Vérifier + créer** → **Créer**. Attends 2 à 3 minutes.

## Étape 4 — Donner un nom au serveur

Sur la page de la VM → **Vue d'ensemble** → **Nom DNS : Non configuré** (clique dessus).
Dans **Étiquette du nom DNS**, mets par exemple `pinvault-quentin` → **Enregistrer**.

Ton adresse devient : `pinvault-quentin.francecentral.cloudapp.azure.com` (la partie `francecentral` dépend de la région).

## Étape 5 — Se connecter au serveur

Dans PowerShell :

```powershell
ssh azureuser@pinvault-quentin.francecentral.cloudapp.azure.com
```

Réponds `yes` à la première question. Tu es maintenant sur le serveur (l'invite devient `azureuser@pinvault-vm`).

## Étape 6 — Récupérer le projet

**Si ton dépôt GitHub est public :**

```bash
git clone https://github.com/<ton-pseudo>/disney-pins.git ~/disney-pins
```

**S'il est privé**, crée une « deploy key » (accès en lecture seule à ce seul dépôt) :

```bash
ssh-keygen -t ed25519 -f ~/.ssh/github_repo -N "" -C "pinvault-vm"
cat ~/.ssh/github_repo.pub
printf 'Host github.com\n  IdentityFile ~/.ssh/github_repo\n' >> ~/.ssh/config
```

Sur GitHub : dépôt → **Settings → Deploy keys → Add deploy key**, colle la clé, **sans** cocher « Allow write access ». Puis :

```bash
git clone git@github.com:<ton-pseudo>/disney-pins.git ~/disney-pins
```

## Étape 7 — Préparer le serveur

```bash
bash ~/disney-pins/deploy/setup-server.sh
```

Ce script installe Docker, active le pare-feu, les mises à jour de sécurité automatiques et fail2ban, ajoute 2 Go de mémoire d'échange et programme la sauvegarde de 3 h du matin. Ensuite :

```bash
exit
```

puis reconnecte-toi (étape 5), pour que les droits Docker soient pris en compte.

## Étape 8 — Configurer les secrets

```bash
cd ~/disney-pins
cp deploy/.env.server.example .env
openssl rand -base64 24    # → copie le résultat pour DB_PASSWORD
openssl rand -base64 48    # → copie le résultat pour JWT_SECRET
nano .env
```

Remplis `DOMAIN` (ton adresse de l'étape 4), `DB_PASSWORD` et `JWT_SECRET`. Enregistre avec **Ctrl+O**, Entrée, puis quitte avec **Ctrl+X**.

> Le mot de passe de la base est fixé au premier démarrage. Ne le change plus ensuite.

## Étape 9 — Lancer le site

```bash
bash deploy/deploy.sh
```

La première fois, compte 5 à 10 minutes : le serveur télécharge les images Docker et compile le projet (sa connexion est très rapide). À la fin, ouvre **https://pinvault-quentin.francecentral.cloudapp.azure.com** sur ton téléphone ou n'importe quel appareil.

## Étape 10 — Déploiement automatique depuis GitHub

Toujours sur le serveur, crée une clé réservée à GitHub Actions :

```bash
ssh-keygen -t ed25519 -f ~/.ssh/github_actions -N "" -C "github-actions-deploy"
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github_actions
```

Sur GitHub : dépôt → **Settings → Secrets and variables → Actions → New repository secret**. Crée ces 3 secrets :

| Nom | Valeur |
|---|---|
| `AZURE_VM_HOST` | `pinvault-quentin.francecentral.cloudapp.azure.com` |
| `AZURE_VM_USER` | `azureuser` |
| `AZURE_VM_SSH_KEY` | tout le contenu affiché par la dernière commande, de `-----BEGIN` à `END ... KEY-----` inclus |

Désormais, à chaque `git push` sur `main` : la CI teste le projet, puis le workflow **Deploy** met le serveur à jour et vérifie que le site répond. Tu peux aussi le lancer à la main : onglet **Actions → Deploy → Run workflow**.

---

## Commandes utiles (sur le serveur)

```bash
cd ~/disney-pins
C="docker compose -f docker-compose.yml -f deploy/docker-compose.server.yml"

$C ps                     # état des conteneurs
$C logs -f backend        # logs de l'API (Ctrl+C pour quitter)
$C logs caddy             # logs HTTPS (utile si le certificat échoue)
$C restart backend        # redémarrer l'API
bash deploy/deploy.sh     # mise à jour manuelle
bash deploy/backup.sh     # sauvegarde immédiate
ls -lh /var/backups/pinvault
```

## Sauvegardes

Chaque nuit à 3 h, `deploy/backup.sh` enregistre la base et les photos dans `/var/backups/pinvault` (14 jours conservés).

Pour en garder une copie sur ton PC (à faire de temps en temps) :

```powershell
scp -r azureuser@pinvault-quentin.francecentral.cloudapp.azure.com:/var/backups/pinvault .\sauvegardes-pinvault
```

Restaurer la base à partir d'une sauvegarde :

```bash
gunzip -c /var/backups/pinvault/db_AAAA-MM-JJ_HHMM.sql.gz | $C exec -T db psql -U pinvault -d pinvault
```

## Dépannage

| Problème | Cause probable |
|---|---|
| Le site ne répond pas du tout | Ports 80/443 fermés : VM → **Réseau** → règles de port entrant |
| Erreur de certificat HTTPS | `DOMAIN` dans `.env` différent du nom DNS de l'étape 4. Regarde `$C logs caddy` |
| Page « 502 » | L'API démarre encore ou a planté : `$C logs backend` |
| `permission denied` avec docker | Tu ne t'es pas reconnecté après `setup-server.sh` |
| Le workflow Deploy échoue en SSH | Secret `AZURE_VM_SSH_KEY` incomplet (il faut aussi les lignes BEGIN/END) |
