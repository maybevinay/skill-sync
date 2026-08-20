# SkillSync

**AI Powered Peer Learning & Mentor Matching Platform**

Learn Faster. Find Mentors. Grow Smarter.

Enterprise-grade SaaS monorepo: React 19 frontend, Spring Boot 3 microservices (API Gateway, Auth, Matching, AI), PostgreSQL, JWT security, explainable mentor matching, GenAI chat, and RAG over PostgreSQL embeddings.

## Architecture

```
skillsync/
  frontend-react/     Vite + React 19 + TypeScript + Tailwind + ShadCN
  backend/
    api-gateway/      Spring Cloud Gateway · JWT · CORS · rate limit
    auth-service/     Registration, JWT, roles, users
    matching-service/ Profiles, skills, matching engine, requests, reviews
    ai-service/       Chat, memory, RAG, embeddings in PostgreSQL
  database/           Schema bootstrap + seeds
  docs/               Setup, OpenAPI notes, Postman
```

## Quick start

See [docs/SETUP.md](docs/SETUP.md).

```bash
# Create PostgreSQL databases skillsync_auth, skillsync_matching, skillsync_ai
# (user root on localhost:5432). See docs/SETUP.md.
# start the four Spring Boot apps, then:
cd frontend-react && npm install && npm run dev
```

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
