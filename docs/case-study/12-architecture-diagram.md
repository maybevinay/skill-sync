# Architecture Diagram

## C4 — System context

```mermaid
flowchart LR
  user[Learner / Mentor / Admin]
  ss[SkillSync Platform]
  pg[(PostgreSQL)]
  llm[OpenAI-compatible API]
  smtp[SMTP optional]

  user -->|HTTPS / localhost HTTP| ss
  ss --> pg
  ss --> llm
  ss --> smtp
```

## C4 — Container

```mermaid
flowchart TB
  browser[SPA Vite :5173]
  gw[API Gateway :8080]
  auth[Auth Service :8081]
  match[Matching Service :8082]
  ai[AI Service :8083]
  dba[(skillsync_auth)]
  dbm[(skillsync_matching)]
  dbi[(skillsync_ai)]
  llm[LLM + embeddings]

  browser --> gw
  gw -->|/api/auth /api/users /api/admin/users...| auth
  gw -->|/api/profile /api/skills /api/mentors /api/requests /api/reviews /api/admin/analytics| match
  gw -->|/api/chat /api/rag /api/admin/ai-stats| ai
  auth --> dba
  match --> dbm
  ai --> dbi
  ai --> llm
```

## C4 — AI container internals

```mermaid
flowchart LR
  RC[RagController]
  CC[ChatController]
  RS[RagService]
  CS[ChatService]
  LLM[LlmGateway]
  VM[VectorMath]
  PDF[PDFBox]

  RC --> RS
  CC --> CS
  RS --> PDF
  RS --> VM
  RS --> LLM
  RS --> CS
  CS --> LLM
```

## Request path (production-style)

```text
Browser
  → Gateway (CORS, rate limit, JWT)
    → Service SecurityFilter (JWT parse, roles)
      → Controller
        → Service
          → JPA / Flyway schema
```

## Matching data flow

```text
Profile + ProfileSkill + Skill
        ↓
MatchingEngine.score
        ↓
MentorCard { matchScore, reasons[] }
        ↓
MentorsPage / MatchesPage
```

## RAG data flow

```text
Multipart PDF/TXT
  → text extract
  → chunk 800 / overlap 120
  → embedding (API or 64-d fallback)
  → rag_chunks.embedding JSON
User question
  → query embedding
  → cosine vs user's chunks
  → top 5
  → grounded prompt
  → LLM + chat_sessions
```

## Network view (local demo)

| Process | Bind |
| --- | --- |
| PostgreSQL | 127.0.0.1:5432 |
| Gateway | :8080 |
| Auth | :8081 |
| Matching | :8082 |
| AI | :8083 |
| Vite | :5173 |

JDBC pattern: `jdbc:postgresql://localhost:5432/{skillsync_auth|skillsync_matching|skillsync_ai}`

## What this architecture deliberately omits

Docker Compose database, Kafka, Redis, Elasticsearch, Pinecone, LangChain, Kubernetes — not required for the current bounded-context HTTP design.
