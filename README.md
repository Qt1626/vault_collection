# PinVault

Application web full-stack pour **cataloguer des pin's Disney** et **gérer sa collection** : une base de données commune alimentée par les membres, et pour chacun une collection personnelle (possédés, recherchés, à échanger) partageable via un lien public.

> Projet personnel de fan, non affilié à The Walt Disney Company.

## Stack technique

| Couche | Technologies |
|---|---|
| Backend | Java 21, Spring Boot 3 (Web, Data JPA, Security, Validation), JWT (jjwt) |
| Base de données | PostgreSQL 16, migrations Flyway |
| Frontend | React 19, TypeScript, Vite, TanStack Query, React Router, Tailwind CSS 4 |
| Tests | JUnit 5, MockMvc, Testcontainers (vraie base PostgreSQL) |
| DevOps | Docker, Docker Compose, GitHub Actions (CI) |
| Documentation API | OpenAPI / Swagger UI (springdoc) |

## Fonctionnalités

- Inscription / connexion avec JWT (mots de passe hachés en BCrypt)
- Catalogue public : recherche plein texte, filtres par parc et type d'édition, pagination
- Fiche détaillée d'un pin avec statistiques communautaires (combien le possèdent, le cherchent, l'échangent)
- Ajout de fiches au catalogue par les membres (seul l'auteur ou un admin peut modifier ou supprimer)
- Collection personnelle en 3 listes : **Je l'ai**, **Je le cherche**, **À échanger**
- Page publique de collection : `/u/<pseudo>`
- Erreurs d'API au format standard RFC 7807 (`application/problem+json`)

## Architecture

```
disney-pins/
├── backend/                  API REST Spring Boot
│   └── src/main/java/com/pinvault/
│       ├── auth/             JWT, inscription, connexion
│       ├── pin/              catalogue (entité, recherche, CRUD)
│       ├── collection/       collections des membres
│       ├── user/             utilisateurs et rôles
│       ├── config/           sécurité, CORS, OpenAPI
│       └── common/           erreurs, pagination
├── frontend/                 SPA React + TypeScript
│   └── src/{api,auth,components,pages}
├── docker-compose.yml
└── .github/workflows/ci.yml
```

Modèle de données : `app_user` 1—n `collection_item` n—1 `pin` (statut + quantité + note, unicité utilisateur/pin/statut).

## Lancer le projet en local

Prérequis : **JDK 21**, **Node 20+**, **Docker Desktop**.

```bash
# 1. Base de données
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
- Tout en conteneurs (front sur http://localhost:3000) : `docker compose --profile full up --build`

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

## Pistes d'évolution

- Upload de photos (stockage S3 / Cloudinary) au lieu d'URL
- Proposition d'échanges entre membres + messagerie
- Mise en relation automatique : « X cherche un pin que tu proposes à l'échange »
- Tests front (Vitest + Testing Library, Playwright)
- Déploiement (Render / Railway / Fly.io) + base managée

## Licence

MIT
