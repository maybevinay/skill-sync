# Functional Requirements

Requirements are derived from implemented controllers, services, and UI routes. Priority: M = must, S = should.

## FR-1 Identity and access

| ID | Requirement | Priority | Implementation |
| --- | --- | --- | --- |
| FR-1.1 | Users register with full name, email, password (8–72 chars), and role USER or MENTOR. ADMIN cannot be self-assigned. | M | `POST /api/auth/register` |
| FR-1.2 | Users log in and receive access + refresh JWT plus user payload. | M | `POST /api/auth/login` |
| FR-1.3 | Access tokens can be refreshed. | M | `POST /api/auth/refresh` |
| FR-1.4 | Logout revokes refresh tokens for the user. | M | `POST /api/auth/logout` |
| FR-1.5 | Forgot/reset password via emailed token (30 minutes). | M | `/forgot-password`, `/reset-password` |
| FR-1.6 | Email verification via token. | M | `/verify-email` |
| FR-1.7 | Authenticated user can read and update own profile name. | M | `GET /api/auth/me`, `PUT /api/users/me` |
| FR-1.8 | Unauthenticated API calls return 401 JSON. Missing permission returns 403. | M | Security configs |

## FR-2 Learner profile and skills

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-2.1 | Maintain profile: name, photo URL, bio, learning goals, years of experience, availability, country, LinkedIn/GitHub/portfolio. | M |
| FR-2.2 | Compute a profile completion score. | S |
| FR-2.3 | Catalog of skills with name, category, description. | M |
| FR-2.4 | Attach skills to a profile with level and progress 0–100. | M |
| FR-2.5 | Admins can create, update, and delete catalog skills. | M |

Seeded skills include Spring Boot, React, TypeScript, MySQL (catalog name), System Design, Machine Learning, Python, Docker, Kubernetes, Communication.

## FR-3 Mentors and matching

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-3.1 | Mentors create a mentor profile (headline, accepting flag). | M |
| FR-3.2 | List mentors with match score and reasons vs current learner. | M |
| FR-3.3 | Dedicated recommendations endpoint. | M |
| FR-3.4 | Score a specific mentor (`GET /api/mentors/{id}/match`). | M |
| FR-3.5 | Weights: skills 50%, goals 20%, experience 15%, availability 10%, rating 5%. | M |

## FR-4 Requests and reviews

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-4.1 | Learner sends a mentorship request with a message. Cannot request self. | M |
| FR-4.2 | Statuses: PENDING, ACCEPTED, DECLINED, COMPLETED. | M |
| FR-4.3 | Only the mentor (or allowed actor) can accept/decline; learner cannot accept own request. | M |
| FR-4.4 | After completion, one review per request (rating + comment). | M |
| FR-4.5 | Mentor rating and review count recalculate from reviews. | M |

## FR-5 AI chat

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-5.1 | Authenticated chat with optional session id and regenerate flag. | M |
| FR-5.2 | SSE-style stream endpoint for tokenized display. | S |
| FR-5.3 | List sessions and load messages for the owning user only. | M |
| FR-5.4 | Persist user/assistant messages; title from first user text. | M |
| FR-5.5 | Fallback reply if LLM is unavailable. | M |

## FR-6 RAG

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-6.1 | Upload PDF or text; extract, chunk (800/120), embed, store. | M |
| FR-6.2 | List current user’s documents. | M |
| FR-6.3 | Ask a question; retrieve top-5 similar chunks; answer from context. | M |
| FR-6.4 | Documents and chunks are scoped by `user_id`. | M |

## FR-7 Administration

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-7.1 | List users, change role, enable/disable accounts. | M |
| FR-7.2 | Auth stats and audit logs. | M |
| FR-7.3 | Matching analytics. | M |
| FR-7.4 | AI usage stats. | M |
| FR-7.5 | Admin UI at `/admin/*` restricted to role ADMIN. | M |

## FR-8 Frontend surfaces

Public: landing, login, register, forgot/reset password, verify email.

App (any authenticated role): dashboard, profile, skills, mentors, matches, requests, reviews, AI assistant, RAG assistant, settings.

Admin: dashboard, users, mentors, analytics, reports.
