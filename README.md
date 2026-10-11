# PinVault

Application web full-stack pour gérer **deux collections** depuis une même page d'accueil :

- **Pin's Disney** : une base de données commune alimentée par les membres, et pour chacun une collection personnelle (possédés, recherchés, à échanger) partageable via un lien public.
- **Cartes Pokémon** : recherche parmi toutes les cartes existantes (API publique [TCGdex](https://tcgdex.dev), en français), suivi de l'état, de la variante, de la langue, de la gradation et de la **cote Cardmarket** de chaque carte.

> Projet personnel de fan, non affilié à The Walt Disney Company, Nintendo, Creatures, GAME FREAK ou The Pokémon Company. Données et images des cartes : TCGdex.

## Stack technique

| Couche | Technologies |
|---|---|
| Backend | Java 21, Spring Boot 3 (Web, Data JPA, Security, Validation), JWT (jjwt) |
| Base de données | PostgreSQL 16, migrations Flyway |
| Frontend | React 19, TypeScript, Vite, TanStack Query, React Router, Tailwind CSS 4 |
| Tests | JUnit 5, MockMvc, Testcontainers (vraie base PostgreSQL) |
| DevOps | Docker, Docker Compose, Dev Container, GitHub Actions (CI + publication Docker Hub) |
| Documentation API | OpenAPI / Swagger UI (springdoc) |

## Fonctionnalités

- Inscription / connexion avec JWT (mots de passe hachés en BCrypt)
- Catalogue public : recherche plein texte, filtres par parc et type d'édition, pagination
- Fiche détaillée d'un pin avec statistiques communautaires (combien le possèdent, le cherchent, l'échangent)
- Ajout de fiches au catalogue par les membres (seul l'auteur ou un admin peut modifier ou supprimer)
- Collection personnelle en 3 listes : **Je l'ai**, **Je le cherche**, **À échanger**
- Page publique de collection : `/u/<pseudo>`
- **Cartes Pokémon** :
  - recherche par nom dans toute la base TCGdex, fiche détaillée (série, numéro, rareté, illustrateur, variantes)
  - cote Cardmarket en euros (tendance, moyenne, plus bas, holo), mise en cache en base et rafraîchie toutes les 24 h
  - collection : quantité, état (Mint → Poor), variante (normale, reverse, holo, 1re édition), langue, gradation (PSA, PCA, CGC, BGS…) et note
  - valeur estimée de la collection, tri par valeur, page publique `/u/<pseudo>/pokemon`
- Upload de photos (JPEG, PNG, GIF, WebP, 5 Mo max) : format vérifié sur le contenu du fichier, stockage dans un volume Docker
- Erreurs d'API au format standard RFC 7807 (`application/problem+json`)

## Architecture

```
disney-pins/
├── backend/                  API REST Spring Boot
│   └── src/main/java/com/pinvault/
│       ├── auth/             JWT, inscription, connexion
│       ├── pin/              catalogue (entité, recherche, CRUD)
│       ├── collection/       collections des membres
│       ├── image/            upload et lecture des photos
│       ├── pokemon/          cartes Pokémon : client TCGdex, cache, collection
│       ├── user/             utilisateurs et rôles
│       ├── config/           sécurité, CORS, OpenAPI
│       └── common/           erreurs, pagination
├── frontend/                 SPA React + TypeScript
│   └── src/{api,auth,components,pages}
├── .devcontainer/            environnement de dev conteneurisé (VS Code)
├── .github/workflows/        ci.yml (tests + smoke test Docker), docker-publish.yml
├── docker-compose.yml        stack complète (db + api + web)
├── docker-compose.prod.yml   même stack à partir des images Docker Hub
└── .env.example              variables à copier dans .env
```

```
Navigateur ──► frontend (Nginx :3000) ──/api──► backend (Spring Boot :8080) ──► db (PostgreSQL)
                 sert le build React             volume « uploads »             volume « pgdata »
```

Modèle de données :
- `app_user` 1—n `collection_item` n—1 `pin` (statut + quantité + note, unicité utilisateur/pin/statut)
- `app_user` 1—n `card_collection_item` n—1 `pokemon_card` (copie locale des fiches TCGdex avec leur cote)

## Démarrage rapide : tout dans Docker

Prérequis : **Docker Desktop** uniquement (ni Java ni Node à installer).

```bash
cp .env.example .env            # une seule fois, puis changer DB_PASSWORD et JWT_SECRET
docker compose up --build       # ou -d pour lancer en arrière-plan
```

| Service | URL |
|---|---|
| Site | http://localhost:3000 |
| API + Swagger UI | http://localhost:8080/swagger-ui.html |
| PostgreSQL | `localhost:5432` (base/utilisateur/mot de passe du `.env`) |

```bash
docker compose ps               # état et healthchecks des 3 conteneurs
docker compose logs -f backend  # logs de l'API
docker compose down             # arrêter (les données et photos sont conservées)
docker compose down -v          # arrêter ET effacer la base et les photos
```

## Environnement de développement (conteneur Linux)

Le projet fournit un **Dev Container** : un conteneur Ubuntu 24.04 avec JDK 21, Maven, Node 22, Git et le client Docker, plus une base PostgreSQL. Toutes les images viennent de Docker Hub (`eclipse-temurin`, `node`, `docker`, `postgres`).

1. Installer **Docker Desktop** et **VS Code** avec l'extension *Dev Containers*
2. Ouvrir le dossier du projet dans VS Code, puis choisir **Reopen in Container**
3. Dans le terminal du conteneur :
   ```bash
   cd backend && mvn spring-boot:run     # API sur http://localhost:8080
   cd frontend && npm run dev            # site sur http://localhost:5173
   ```

## Images Docker Hub

Quand la CI est verte sur `main` (ou sur un tag `v*`), GitHub Actions publie `pinvault-api` et `pinvault-web` sur Docker Hub (workflow `docker-publish.yml`). Secrets à créer dans le dépôt GitHub (*Settings > Secrets and variables > Actions*) : `DOCKERHUB_USERNAME` et `DOCKERHUB_TOKEN`.

Pour lancer l'application sans rien compiler (renseigner `DOCKERHUB_USERNAME`, `DB_PASSWORD` et `JWT_SECRET` dans `.env`) :
```bash
docker compose -f docker-compose.prod.yml up -d    # http://localhost:3000
```

## Mise en production (Azure)

Le site peut être hébergé sur une VM Azure (Ubuntu) avec la même stack Docker, plus **Caddy** pour le HTTPS automatique :

- `deploy/docker-compose.server.yml` : ajoute Caddy et ferme tous les autres ports
- `deploy/setup-server.sh` : installation (Docker, pare-feu, fail2ban, mises à jour de sécurité, sauvegarde nocturne)
- `deploy/deploy.sh` : mise à jour depuis GitHub · `deploy/backup.sh` : sauvegarde base + photos
- `.github/workflows/deploy.yml` : déploiement automatique quand la CI est verte sur `main`

Guide pas à pas : [docs/DEPLOIEMENT-AZURE.md](docs/DEPLOIEMENT-AZURE.md)

## Lancer le projet en local (sans conteneur)

Prérequis : **JDK 21**, **Node 20+**, **Docker Desktop**.

```bash
# 1. Base de données (seule)
docker compose up -d db

# 2. Backend (http://localhost:8080) — depuis IntelliJ : lancer PinVaultApplication
cd backend
mvn spring-boot:run

# 3. Frontend (http://localhost:5173)
cd frontend
npm install
npm run dev
```

- Swagger UI : http://localhost:8080/swagger-ui.html

### Tests

```bash
cd backend && mvn verify      # tests unitaires + intégration (Docker requis pour Testcontainers)
cd frontend && npm run lint && npm run build
```

## API (résumé)

| Méthode | Route | Auth |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | — |
| GET | `/api/auth/me` | ✔ |
| GET | `/api/pins?q=&park=&edition=&year=&page=&size=` | — |
| GET | `/api/pins/{id}` | — |
| POST / PUT / DELETE | `/api/pins[/{id}]` | ✔ (auteur ou admin) |
| GET / POST | `/api/me/collection` | ✔ |
| PATCH / DELETE | `/api/me/collection/{itemId}` | ✔ |
| GET | `/api/users/{username}/collection` | — |
| GET | `/api/pokemon/cards?q=&page=` | — |
| GET | `/api/pokemon/cards/{id}` | — |
| GET / POST | `/api/me/pokemon` | ✔ |
| PUT / DELETE | `/api/me/pokemon/{itemId}` | ✔ |
| GET | `/api/users/{username}/pokemon` | — |
| POST | `/api/images` (upload) · GET `/api/images/{fichier}` | ✔ · — |

## Pistes d'évolution

- Stockage des photos sur S3 / Cloudinary pour un hébergement multi-instances
- Proposition d'échanges entre membres + messagerie
- Mise en relation automatique : « X cherche un pin que tu proposes à l'échange »
- Tests front (Vitest + Testing Library, Playwright)
- Déploiement (Render / Railway / Fly.io) + base managée

## Licence

MIT
