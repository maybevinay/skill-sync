# API Design

Base (via gateway): `http://localhost:8080`  
Direct: auth `8081`, matching `8082`, AI `8083`.

Unless noted, send `Authorization: Bearer <accessToken>` and `Content-Type: application/json`.

OpenAPI: `/swagger-ui.html` on each service. Postman: `docs/postman/SkillSync.postman_collection.json`.

## Conventions

| Item | Rule |
| --- | --- |
| Success | 200 OK; register 201 |
| Auth missing | 401 `{ status, error, message }` |
| Forbidden | 403 |
| Validation | 400 |
| Duplicate | 409 (e.g. email, skill name) |
| Not found | 404 |

## Auth — `/api/auth`

| Method | Path | Auth | Body | Response |
| --- | --- | --- | --- | --- |
| POST | `/register` | Public | `{ fullName, email, password, role }` | `AuthResponse` |
| POST | `/login` | Public | `{ email, password }` | `AuthResponse` |
| POST | `/refresh` | Public | `{ refreshToken }` | `AuthResponse` |
| POST | `/logout` | User | — | 200 |
| POST | `/forgot-password` | Public | `{ email }` | 200 |
| POST | `/reset-password` | Public | `{ token, newPassword }` | 200 |
| POST | `/verify-email` | Public | `{ token }` | 200 |
| GET | `/me` | User | — | `UserResponse` |

`AuthResponse` includes `accessToken`, `refreshToken`, and `user` (`id`, `fullName`, `email`, `role`, flags).

`PUT /api/users/me` — update display name (`UpdateProfileRequest`).

## Admin users — `/api/admin` (ADMIN)

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/users` | List |
| PATCH | `/users/{id}/role` | `{ role }` |
| PATCH | `/users/{id}/enabled` | `{ enabled }` |
| GET | `/stats` | Counts |
| GET | `/audit-logs` | Recent actions |

## Profile and skills

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/profile/me` | User | Profile + skills + completion |
| PUT | `/api/profile/me` | User | `ProfileRequest` |
| POST | `/api/profile/me/skills` | User | `{ skillId, level, progress }` |
| DELETE | `/api/profile/me/skills/{skillId}` | User | Remove skill |
| GET | `/api/skills` | User | Catalog |
| POST | `/api/skills` | Admin | Create |
| PUT | `/api/skills/{id}` | Admin | Update |
| DELETE | `/api/skills/{id}` | Admin | Delete |

## Mentors and matching

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/mentors/me` | Upsert mentor profile |
| GET | `/api/mentors` | Cards with `matchScore`, `reasons`, `skills` |
| GET | `/api/mentors/recommendations` | Ranked recommendations |
| GET | `/api/mentors/{id}/match` | `MatchScoreResponse` |

## Requests and reviews

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/requests` | `{ mentorId, message }` |
| GET | `/api/requests` | Inbox / sent (role-aware) |
| PATCH | `/api/requests/{id}` | Status change |
| POST | `/api/reviews` | `{ requestId, rating, comment }` |
| GET | `/api/mentors/{mentorId}/reviews` | Public-to-auth reviews |
| GET | `/api/reviews` | Current user reviews |

Matching analytics: `GET /api/admin/analytics` (ADMIN).

## Chat — `/api`

| Method | Path | Body / notes |
| --- | --- | --- |
| POST | `/chat` | `{ sessionId?, message, regenerate }` → `{ sessionId, content, role }` |
| POST | `/chat/stream` | Same body; `text/event-stream` whitespace tokens |
| GET | `/chat/sessions` | `{ id, title, updatedAt }[]` |
| GET | `/chat/sessions/{id}` | `{ id, title, messages[] }` owner-only |

## RAG — `/api/rag`

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/documents` | `multipart/form-data` field `file` (PDF or text), max 15 MB |
| GET | `/documents` | `{ id, filename, createdAt }[]` |
| POST | `/chat` | `{ sessionId?, question }` |

AI admin: `GET /api/admin/ai-stats` (ADMIN).

## Gateway routes

| id | Predicate |
| --- | --- |
| auth | `/api/auth/**`, `/api/users/**`, `/api/admin/users`, `/api/admin/users/**`, `/api/admin/stats`, `/api/admin/audit-logs` |
| matching | `/api/profile/**`, `/api/skills/**`, `/api/mentors/**`, `/api/requests`, `/api/requests/**`, `/api/reviews`, `/api/reviews/**`, `/api/admin/analytics` |
| ai | `/api/chat`, `/api/chat/**`, `/api/rag/**`, `/api/admin/ai-stats` |

CORS: `http://localhost:5173`, credentials allowed. Rate limit: 120/minute.

## Sample: login

```http
POST /api/auth/login HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{"email":"user@skillsync.dev","password":"User@12345"}
```

## Sample: RAG ask

```http
POST /api/rag/chat HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{"sessionId":1,"question":"What did my notes say about Spring Security filters?"}
```
