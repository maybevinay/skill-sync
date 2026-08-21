# SkillSync Setup Guide

## Prerequisites

- JDK 21
- Maven 3.9+
- Node.js 20+
- PostgreSQL 16+ listening on `localhost:5432`
- An OpenAI-compatible and/or Gemini API key if you want live AI chat and RAG (optional for auth/matching)

## 1. Configure environment

```bash
cp .env.example .env
```

Edit `.env` for database credentials, `JWT_SECRET`, and AI keys. Never commit `.env`.

Create databases `skillsync_auth`, `skillsync_matching`, and `skillsync_ai` for user `root` (see `database/init/01-create-databases.sql`). The start script does this automatically if `psql` is on your PATH.

```bash
psql -h localhost -p 5432 -U root -d postgres -f database/init/01-create-databases.sql
```

If role `root` does not exist, create it as a superuser, then grant access to those databases.

For RAG, the **pgvector** extension must be installed into PostgreSQL (files `lib/vector.dll` and `share/extension/vector*` on Windows). After that, ai-service runs `CREATE EXTENSION IF NOT EXISTS vector` on `skillsync_ai`. If the extension package is missing, ai-service still starts and falls back to in-process cosine search.

## 2. Start everything (recommended)

PostgreSQL must already be running. From the **repo root** on Windows:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start.ps1
```

Or double-click **`start.cmd`**.

The script:

1. Creates `.env` from `.env.example` if needed
2. Checks Java, Maven, Node, npm, and Postgres port 5432
3. Creates the three databases when `psql` is available
4. Runs `npm install` in `frontend-react` when `node_modules` is missing
5. Opens one PowerShell window each for auth, matching, AI, gateway, and the Vite frontend
6. Waits until `/actuator/health` is `UP` on 8080–8083
7. Opens http://localhost:5173

Stop listeners on 5173 and 8080–8083:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/stop.ps1
```

Or double-click **`stop.cmd`**. PostgreSQL is left running.

Optional flags for `scripts/start.ps1`:

| Flag | Effect |
| --- | --- |
| `-SkipFrontend` | Backends only |
| `-SkipInstall` | Do not run `npm install` |
| `-NoBrowser` | Do not open the app in a browser |

The first Maven start can take several minutes. Leave the service windows open while you use the app.

| Service | Port | Database |
| --- | --- | --- |
| Frontend (Vite) | 5173 | — |
| API Gateway | 8080 | — |
| Auth | 8081 | skillsync_auth |
| Matching | 8082 | skillsync_matching |
| AI | 8083 | skillsync_ai |

Flyway runs on backend startup. Seed users:

- `admin@skillsync.dev` / `Admin@12345` (ADMIN)
- `mentor@skillsync.dev` / `Mentor@12345` (MENTOR)
- `user@skillsync.dev` / `User@12345` (USER)

## 3. Start services yourself (optional)

Use this only if you are not using `start.cmd`. Four backend terminals:

```bash
cd backend/auth-service && mvn spring-boot:run
cd backend/matching-service && mvn spring-boot:run
cd backend/ai-service && mvn spring-boot:run
cd backend/api-gateway && mvn spring-boot:run
```

Then the frontend:

```bash
cd frontend-react
npm install
npm run dev
```

Open http://localhost:5173

Set `VITE_API_BASE_URL=http://localhost:8080` in `.env` if you want the SPA to prefer the gateway. In local development the SPA may also call 8081/8082/8083 directly.

## 4. AI configuration

Put keys in `.env` (loaded by `scripts/start.ps1`) or export them in the shell. Never commit secrets.

```bash
OPENAI_API_KEY=...
OPENAI_BASE_URL=https://openai.generative-eu.engine.capgemini.com/v1
OPENAI_MODEL=openai.gpt-5-mini
OPENAI_EMBEDDING_MODEL=amazon.titan-embed-text-v1

GEMINI_API_KEY=...
GEMINI_MODEL=gemini-3.6-flash
```

Any OpenAI-compatible endpoint works (Capgemini Generative Engine, OpenAI, Groq, Azure OpenAI proxy, Ollama via `/v1`). Gemini is used when `GEMINI_API_KEY` is set.

## 5. Tests

Unit / service tests (do not require the full stack):

```bash
cd backend/auth-service && mvn test
cd backend/matching-service && mvn test
cd backend/ai-service && mvn test
cd backend/api-gateway && mvn test
cd frontend-react && npm test
```

Live API smoke test **after** the stack is up:

```bash
node scripts/qa-api.mjs
```

## 6. API docs

- App: http://localhost:5173
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
