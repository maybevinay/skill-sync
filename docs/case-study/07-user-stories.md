# User Stories

Format: *As a … I want … so that …*  
Acceptance is mapped to APIs or UI routes.

## Epic A — Account

| ID | Story | Acceptance |
| --- | --- | --- |
| US-A1 | As a visitor, I want to register as USER or MENTOR so that I can use the platform. | `POST /api/auth/register` returns tokens; ADMIN role coerced to USER |
| US-A2 | As a user, I want to log in so that I can access `/app`. | JWT stored; redirect to dashboard |
| US-A3 | As a user, I want a forgotten-password flow so that I can regain access. | Email link to `/reset-password?token=` |
| US-A4 | As a user, I want my session refreshed so that I stay logged in. | Axios interceptor on 401 → `/api/auth/refresh` |
| US-A5 | As a user, I want to log out so that my refresh tokens stop working. | `POST /api/auth/logout` |

## Epic B — Profile and skills

| ID | Story | Acceptance |
| --- | --- | --- |
| US-B1 | As a learner, I want to edit bio, goals, experience, and availability so that matching is accurate. | `PUT /api/profile/me` |
| US-B2 | As a learner, I want to add skills with level and progress so that overlap can be scored. | `POST /api/profile/me/skills` |
| US-B3 | As an admin, I want to maintain the skill catalog so that names stay consistent. | `/api/skills` CUD |

## Epic C — Matching

| ID | Story | Acceptance |
| --- | --- | --- |
| US-C1 | As a learner, I want a ranked mentor list with reasons so that I trust the recommendation. | `GET /api/mentors` cards include `matchScore` and `reasons` |
| US-C2 | As a learner, I want recommendations tailored to me. | `GET /api/mentors/recommendations` |
| US-C3 | As a mentor, I want a headline and accepting flag so that I control inbound demand. | `POST /api/mentors/me` |

## Epic D — Mentorship lifecycle

| ID | Story | Acceptance |
| --- | --- | --- |
| US-D1 | As a learner, I want to request a mentor with a message. | `POST /api/requests` |
| US-D2 | As a mentor, I want to accept or decline. | `PATCH /api/requests/{id}` |
| US-D3 | As a learner, I want to leave one review after a completed request. | `POST /api/reviews`; duplicate rejected |
| US-D4 | As anyone, I want to read a mentor’s reviews. | `GET /api/mentors/{id}/reviews` |

## Epic E — AI

| ID | Story | Acceptance |
| --- | --- | --- |
| US-E1 | As a user, I want ChatGPT-style mentoring chat with history. | `/app/ai`, `POST /api/chat` |
| US-E2 | As a user, I want to regenerate the last answer. | `regenerate: true` |
| US-E3 | As a user, I want my sessions listed and reopenable. | `GET /api/chat/sessions` |
| US-E4 | As a user, I must not open another user’s session. | 404 if `userId` mismatch |
| US-E5 | As a user, I want to upload PDF/text notes and ask grounded questions. | `/app/rag`, `/api/rag/*` |

## Epic F — Admin

| ID | Story | Acceptance |
| --- | --- | --- |
| US-F1 | As an admin, I want to change roles and disable users. | `/api/admin/users` |
| US-F2 | As an admin, I want stats, audit logs, matching analytics, and AI usage. | admin endpoints + `/admin` UI |
| US-F3 | As a non-admin, I must not open `/admin`. | `RequireAuth roles={["ADMIN"]}` |

## Story mapping (journey)

```text
Discover → Register → Profile → Match → Request → Session → Review
                ↘ AI Chat
                ↘ RAG upload → Ask
Admin: Users → Roles → Analytics → Reports
```
