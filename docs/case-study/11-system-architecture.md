# System Architecture

## Style

SkillSync is a **modular monolith-adjacent microservice system**: four independently started Spring Boot processes plus a SPA, sharing a JWT secret and talking over HTTP. It is not a Kubernetes mesh. Data is split by bounded context. On Windows, `start.cmd` / `scripts/start.ps1` launches those processes together for local development.

## Logical layers

1. **Presentation** — React 19 SPA (`frontend-react`), React Router, TanStack Query, Axios.
2. **Edge** — Spring Cloud Gateway: CORS, JWT gate, rate limit, path routing.
3. **Application services** — Auth, Matching, AI (each with web / service / domain / repository).
4. **Persistence** — PostgreSQL 16+, Flyway, Spring Data JPA, HikariCP, `ddl-auto: validate`.
5. **Intelligence** — Spring AI ChatModel + EmbeddingModel against an OpenAI-compatible base URL.

## Service responsibilities

| Service | Port | Owns | Does not own |
| --- | --- | --- | --- |
| api-gateway | 8080 | Routing, CORS, rate limit, JWT presence on protected paths | Business data |
| auth-service | 8081 | Users, credentials, JWT issue, mail tokens, admin users | Profiles, AI |
| matching-service | 8082 | Profiles, skills, matching, requests, reviews | Passwords |
| ai-service | 8083 | Chat memory, RAG documents/chunks, usage | Matching scores |

A second module `backend/gateway` exists as a related gateway implementation; **local setup runs `backend/api-gateway`**.

## Cross-cutting

| Concern | Approach |
| --- | --- |
| AuthN | Bearer JWT, HS256, issuer `skillsync` |
| AuthZ | Roles in token; method/HTTP security; frontend `RequireAuth` |
| Validation | Jakarta Validation on DTOs |
| Errors | Per-service `GlobalExceptionHandler` JSON |
| API docs | springdoc OpenAPI on 8081–8083 |
| Config | `application.yml` + env (`POSTGRES_*`, `JWT_*`, `OPENAI_*`) |
| Instant mapping | `hibernate.type.preferred_instant_jdbc_type: TIMESTAMP` |

## Matching architecture

`MentorService` loads the learner profile and accepting mentors, then calls static `MatchingEngine.score`. No ML ranker. Reasons are deterministic strings.

## AI architecture

```text
ChatService  → LlmGateway.complete(system, history, user)
RagService   → extract → chunk → LlmGateway.embed → store JSON
             → embed query → cosine top-5 → ChatService.chat(grounded prompt)
```

If `ChatModel` / `EmbeddingModel` beans are absent (no API key), chat uses a static fallback and embeddings use `VectorMath.fallbackEmbed` (64-d hashed vector).

## Frontend architecture

- Feature folders: `auth`, `dashboard`, `profile`, `skills`, `mentors`, `matching`, `requests`, `reviews`, `ai`, `admin`, `landing`.
- `AuthContext` holds user and tokens (`localStorage` keys `ss_access`, `ss_refresh`).
- Theme via `ThemeContext`.
- Direct service ports in `serviceBase()` for local DX; gateway remains the documented production edge.

## Trust boundaries

- Browser is untrusted; JWT required after login.
- Gateway is the public entry (when used).
- Each service re-validates JWT (does not trust gateway alone).
- LLM provider is an external trust boundary; prompts may contain user documents.

## Quality tactics

- **Isolation:** three databases.
- **Degradation:** LLM and SMTP optional.
- **Explainability:** match reasons in API.
- **Testability:** engine and vector math are pure functions.
