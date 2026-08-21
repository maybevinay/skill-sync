# Case Study Document

## Title

**SkillSync — AI-Powered Peer Learning and Mentorship Program**

## Organization / product

SkillSync is a full-stack SaaS platform that connects learners with mentors using explainable matching scores, structured skill profiles, mentorship requests and reviews, and an AI assistant with document-grounded RAG.

## Business context

Engineering professionals need faster skill growth than traditional courses provide. Peer mentoring works, but finding the *right* mentor is slow, opaque, and poorly instrumented. SkillSync treats matching as a scored, explainable product — not a social feed — and adds GenAI so learners can study against their own notes.

## Objectives

1. Let users register as learners or mentors with JWT-secured sessions.
2. Capture skills, goals, experience, and availability in a profile.
3. Rank mentors with a transparent weighted algorithm and human-readable reasons.
4. Support request, accept/decline, complete, and review workflows.
5. Provide an AI mentor chat with persistent conversation memory.
6. Allow PDF/text knowledge upload and cosine-similarity RAG over PostgreSQL.
7. Give administrators user, mentor, analytics, and audit visibility.

## Scope

**In scope:** web app (React), API gateway, auth, matching, AI/RAG, PostgreSQL schemas, JWT roles USER / MENTOR / ADMIN.

**Out of scope:** payments/billing, native mobile apps, video calling, calendar booking, Kubernetes/production cluster, third-party vector databases.

## Solution snapshot

| Layer | Technology |
| --- | --- |
| UI | React 19, Vite, TypeScript, Tailwind CSS, TanStack Query |
| Edge | Spring Cloud Gateway (port 8080), CORS, JWT, 120 req/min rate limit |
| Auth | Spring Boot 3.3.5, JPA, Flyway, BCrypt, HS256 JWT (port 8081) |
| Matching | Spring Boot matching engine (port 8082) |
| AI | Spring AI (OpenAI-compatible), PDFBox, chat + RAG (port 8083) |
| Data | PostgreSQL 16+ — databases `skillsync_auth`, `skillsync_matching`, `skillsync_ai` |

## Matching algorithm (product differentiator)

| Signal | Weight |
| --- | --- |
| Skill overlap | 50% |
| Learning-goal match | 20% |
| Experience gap | 15% |
| Availability | 10% |
| Mentor rating | 5% |

Implemented in `MatchingEngine` (`backend/matching-service`). Each recommendation includes a 0–100 score and a list of reasons.

## GenAI / RAG snapshot

- Chat: system prompt + session history + user turn → LLM (fallback if no API key).
- RAG: PDF/text extract → 800-character chunks with 120 overlap → embeddings → JSON vectors in `rag_chunks.embedding` → top-5 cosine retrieval → grounded prompt → same chat memory.

## Outcomes

- Isolated microservices and databases per bounded context.
- Seeded demo accounts for USER, MENTOR, and ADMIN.
- Automated tests for auth, matching, gateway JWT/rate-limit, chat isolation, vector math, and frontend helpers.
- Source repository: https://github.com/Amitag87/SkillSync-Peer-Learning-and-Mentorship-Program

## Constraints and assumptions

- Local PostgreSQL on `localhost:5432`.
- OpenAI-compatible endpoint (for example Capgemini Generative Engine).
- No payment processing.
- RAG embeddings stored as TEXT (JSON float arrays), not pgvector.

## Document map

See [00-INDEX.md](00-INDEX.md) for the full case-study pack.
