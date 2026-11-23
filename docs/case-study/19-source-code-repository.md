# Source Code Repository

## Canonical remote

**GitHub:** [https://github.com/Amitag87/SkillSync-Peer-Learning-and-Mentorship-Program](https://github.com/Amitag87/SkillSync-Peer-Learning-and-Mentorship-Program)

| Item | Value |
| --- | --- |
| Default branch | `main` |
| License | MIT (see repository `README.md`) |
| Visibility | Per GitHub project settings |

## Local clone

```bash
git clone https://github.com/Amitag87/SkillSync-Peer-Learning-and-Mentorship-Program.git
cd SkillSync-Peer-Learning-and-Mentorship-Program
```

Copy `.env.example` to `.env`, start PostgreSQL, then from the repo root on Windows:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start.ps1
```

Or double-click `start.cmd`. Full setup: [`docs/SETUP.md`](../SETUP.md).

## Top-level layout

```text
skillsync/
  README.md
  start.cmd / stop.cmd        # one-command local run (Windows)
  .gitignore
  .env.example
  docker-compose.yml          # no MySQL/Postgres containers; local PG expected
  package-lock.json
  scripts/                    # start.ps1, stop.ps1, qa-api.mjs
  database/init/              # CREATE DATABASE scripts
  docs/
    SETUP.md
    postman/
    case-study/               # this documentation pack
  frontend-react/             # Vite + React 19 SPA
  backend/
    api-gateway/              # Spring Cloud Gateway :8080
    gateway/                  # additional gateway module
    auth-service/             # :8081
    matching-service/         # :8082
    ai-service/               # :8083
```

## Notable paths

| Concern | Path |
| --- | --- |
| Matching weights | `backend/matching-service/.../engine/MatchingEngine.java` |
| JWT issue | `backend/auth-service/.../security/JwtService.java` |
| Chat + system prompt | `backend/ai-service/.../service/ChatService.java` |
| RAG ingest/ask | `backend/ai-service/.../service/RagService.java` |
| Cosine / chunk helpers | `backend/ai-service/.../rag/VectorMath.java` |
| Gateway routes | `backend/api-gateway/src/main/resources/application.yml` |
| SPA routes | `frontend-react/src/app/App.tsx` |
| Local start / stop | `scripts/start.ps1`, `scripts/stop.ps1`, `start.cmd` |
| Live API smoke | `scripts/qa-api.mjs` |
| Auth Flyway | `backend/auth-service/src/main/resources/db/migration/` |

## What is not in Git

- `.env`, `frontend-react/.env` (secrets)
- `node_modules/`, `target/`, IDE folders
- AI upload binaries (`backend/ai-service/uploads/`)

## Build coordinates

| Module | Artifact | Parent |
| --- | --- | --- |
| auth-service | `com.skillsync:auth-service:1.0.0` | Spring Boot 3.3.5 |
| matching-service | `com.skillsync:matching-service:1.0.0` | same |
| ai-service | `com.skillsync:ai-service:1.0.0` | Spring AI 1.0.0-M5 BOM |
| api-gateway | `com.skillsync` gateway | Spring Cloud Gateway |
| frontend | `skillsync-frontend` 1.0.0 | npm |

## Contribution / exam submission checklist

- [ ] `main` contains latest docs under `docs/case-study/`
- [ ] No API keys in YAML defaults
- [ ] README points to SETUP and `start.cmd`
- [ ] Demo accounts documented (passwords are **dev seeds**, rotate in any shared environment)
