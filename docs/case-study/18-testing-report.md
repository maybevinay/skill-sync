# Testing Report

## 1. Scope

This report covers **automated tests in the repository** and **manual checks documented for demo**. It does not claim a full production load test or live LLM evaluation suite.

## 2. Strategy

| Layer | Tool | Location |
| --- | --- | --- |
| Auth API | JUnit 5 + MockMvc + Spring Boot Test | `auth-service` |
| Auth unit | Mockito / JUnit | `AuthServiceTest`, `JwtServiceTest` |
| Matching unit | JUnit | engine, services |
| Gateway unit | JUnit | JWT forward, rate limit |
| AI unit | JUnit | `ChatServiceTest`, `VectorMathTest` |
| Frontend | Vitest | `frontend-react/src/lib/*.test.ts` |
| Live API smoke | Node fetch script | `scripts/qa-api.mjs` (stack must be running) |
| Manual API | Postman | `docs/postman/SkillSync.postman_collection.json` |

Test datasources: in-memory **H2** with `MODE=PostgreSQL` (not the developer PostgreSQL instance).

## 3. How to run

```bash
cd backend/auth-service && mvn test
cd backend/matching-service && mvn test
cd backend/ai-service && mvn test
cd backend/api-gateway && mvn test
cd frontend-react && npm test
```

With the full stack running (`start.cmd` or `scripts/start.ps1`):

```bash
node scripts/qa-api.mjs
```

## 4. Automated inventory

### auth-service

| Class | Cases |
| --- | --- |
| AuthServiceApplicationTests | login seeded user; duplicate register → 409 |
| AuthServiceTest | duplicate email, ADMIN→USER, login failures/success, update me, sha256 |
| JwtServiceTest | token helpers |

### matching-service

| Class | Cases |
| --- | --- |
| MatchingEngineTest | overlap → high score and reasons |
| ProfileServiceTest | completion scoring |
| SkillServiceTest | duplicate name, delete missing |
| MentorServiceTest | zero initial rating |
| RequestReviewServiceTest | ACL on requests, self-request, reviews, rating range |

### ai-service

| Class | Cases |
| --- | --- |
| ChatServiceTest | session isolation, blank/null message |
| VectorMathTest | cosine, JSON, chunking, empty text |

### api-gateway

| Class | Cases |
| --- | --- |
| JwtForwardingFilterTest | public login, protected 401, OPTIONS |
| RateLimitFilterTest | throttle |

### frontend-react

Vitest files: `api.test.ts`, `auth.test.ts`, `cn.test.ts` (helper coverage, not full page RTL suite).

## 5. Results (last known local run in this workspace)

| Module | Result | Notes |
| --- | --- | --- |
| auth-service `mvn test` | Passed | Flyway on H2; DataSeeder runs in Spring tests |
| matching-service `mvn test` | Passed | |
| ai-service `mvn test` | Passed | LLM not required for unit tests |
| frontend `npm test` | Passed historically (10 Vitest tests) | Re-run after UI changes if needed |

Gateway tests exist; run `mvn test` in `backend/api-gateway` as part of a full gate.

## 6. Gaps (honest)

| Gap | Risk | Mitigation |
| --- | --- | --- |
| No Testcontainers PostgreSQL | Drift vs H2 | Manual smoke on :5432 |
| No live embedding/LLM contract tests | RAG quality unverified in CI | Manual RAG page |
| No Cypress/Playwright E2E | UI regressions | Demo checklist in 20-demo-screenshots |
| Chat stream is simulated token split | Not true model streaming | Documented in API design |
| Cosine over all user chunks in memory | Slow at large N | Acceptable for coursework scale |

## 7. Defects found in prior QA (already fixed in code)

Examples from development history (not open bugs):

- Auth missing JWT returned 403 instead of 401 (broke refresh interceptor).
- Mail health made actuator 503.
- LLM fallback `.formatted()` crashed on `%` in user text.
- Lazy-load / transaction issues on mentor explain and chat session mapping.

## 8. Recommendation for examiners

1. Run the four `mvn test` / `npm test` commands.
2. Start PostgreSQL + four services + Vite.
3. Execute Postman: login → profile → mentors → chat.
4. Upload a short TXT to RAG and ask a question contained in the file.

## 9. Sign-off (documentation)

| Item | Status |
| --- | --- |
| Unit / API automated suite | Implemented and previously green |
| E2E browser automation | Not in repo |
| Performance / security pentest | Not in repo |
| LLM evaluation harness | Not in repo |
