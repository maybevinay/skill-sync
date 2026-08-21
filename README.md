# SkillSync

**AI Powered Peer Learning & Mentor Matching Platform**

Learn Faster. Find Mentors. Grow Smarter.

Enterprise-grade SaaS monorepo: React 19 frontend, Spring Boot 3 microservices (API Gateway, Auth, Matching, AI), PostgreSQL, JWT security, explainable mentor matching, GenAI chat, and RAG over PostgreSQL embeddings.

## Architecture

```
skillsync/
  start.cmd           Double-click to run Eureka, auth, matching, AI, gateway, UI
  stop.cmd            Stop listeners on 5173, 8080–8083, and Eureka 8761
  scripts/            start.ps1, stop.ps1, qa-api.mjs
  frontend-react/     Vite + React 19 + TypeScript + Tailwind + ShadCN
  backend/
    api-gateway/      Spring Cloud Gateway · JWT · CORS · rate limit · Eureka
    eureka-server/    Netflix Eureka service registry :8761
    auth-service/     Registration, JWT, roles, users
    matching-service/ Profiles, skills, matching engine, requests, reviews
    ai-service/       Chat, memory, RAG, embeddings in PostgreSQL
  database/           Schema bootstrap + seeds
  docs/               Setup, OpenAPI notes, Postman, case-study pack
```

## Quick start

See [docs/SETUP.md](docs/SETUP.md). Case-study documentation: [docs/case-study/00-INDEX.md](docs/case-study/00-INDEX.md).

PostgreSQL must already be running on `localhost:5432`. Then start everything:

```powershell
# double-click start.cmd, or:
powershell -ExecutionPolicy Bypass -File scripts/start.ps1
```

That opens http://localhost:5173 after the backends are healthy. Stop with `stop.cmd` or `scripts/stop.ps1`.

Full steps, ports, demo users, and a manual (multi-terminal) alternative: [docs/SETUP.md](docs/SETUP.md).

## Roles

`USER` · `MENTOR` · `ADMIN`

## Matching weights

| Signal | Weight |
| --- | --- |
| Skill compatibility | 50% |
| Learning goal match | 20% |
| Experience match | 15% |
| Availability match | 10% |
| Rating | 5% |

## License

MIT
