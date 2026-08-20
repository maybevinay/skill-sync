# SkillSync Setup Guide

## Prerequisites

- JDK 21
- Maven 3.9+
- Node.js 20+
- PostgreSQL 16+ (localhost:5432)
- An OpenAI-compatible API key for the AI assistant

## 1. Start PostgreSQL

Create databases `skillsync_auth`, `skillsync_matching`, and `skillsync_ai` for user `root` (see `database/init/01-create-databases.sql`).

```bash
cp .env.example .env
psql -h localhost -p 5432 -U root -d postgres -f database/init/01-create-databases.sql
```

If role `root` does not exist, create it as a superuser, then grant access to those databases.

## 2. Backend services

From four terminals:

```bash
cd backend/auth-service && mvn spring-boot:run
cd backend/matching-service && mvn spring-boot:run
cd backend/ai-service && mvn spring-boot:run
cd backend/api-gateway && mvn spring-boot:run
```

| Service | Port | Database |
| --- | --- | --- |
| API Gateway | 8080 | — |
| Auth | 8081 | skillsync_auth |
| Matching | 8082 | skillsync_matching |
| AI | 8083 | skillsync_ai |

Flyway runs on startup. Seed users:

- `admin@skillsync.dev` / `Admin@12345` (ADMIN)
- `mentor@skillsync.dev` / `Mentor@12345` (MENTOR)
- `user@skillsync.dev` / `User@12345` (USER)

## 3. Frontend

```bash
cd frontend-react
npm install
npm run dev
```

Open http://localhost:5173

Set `VITE_API_BASE_URL=http://localhost:8080` in `.env`.

## 4. AI configuration

Export (never commit):

```bash
OPENAI_API_KEY=...
OPENAI_BASE_URL=https://openai.generative-eu.engine.capgemini.com/v1
OPENAI_MODEL=openai.gpt-5-mini
OPENAI_EMBEDDING_MODEL=amazon.titan-embed-text-v1
```

Any OpenAI-compatible endpoint works (Capgemini Generative Engine, OpenAI, Groq, Azure OpenAI proxy, Ollama via `/v1`).

## 5. Tests

```bash
cd backend/auth-service && mvn test
cd backend/matching-service && mvn test
cd backend/ai-service && mvn test
cd frontend-react && npm test
```

## 6. API docs

- Gateway health: http://localhost:8080/actuator/health
- Auth Swagger: http://localhost:8081/swagger-ui.html
- Matching Swagger: http://localhost:8082/swagger-ui.html
- AI Swagger: http://localhost:8083/swagger-ui.html
- Postman: `docs/postman/SkillSync.postman_collection.json`

## 7. Production notes

- Replace `JWT_SECRET` with a 256-bit random value shared by gateway and services.
- Put the gateway behind TLS (nginx/Caddy).
- Restrict CORS origins in `skillsync.cors.allowed-origins`.
- Persist AI uploads on object storage in production.
