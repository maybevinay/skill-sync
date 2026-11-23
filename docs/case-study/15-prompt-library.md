# Prompt Library

All prompts below are **as implemented** in the current codebase (not aspirational). Locations are Java sources unless noted.

## P-01 Chat system prompt (primary)

**Where:** `ChatService.SYSTEM` in `backend/ai-service/.../service/ChatService.java`  
**When:** Every `/api/chat` completion (and RAG, because RAG calls `chatService.chat`).  
**Role:** System

```text
You are SkillSync, an AI mentor for engineers. Be concise, practical, and cite matching/learning strategy when relevant.
Help with skills, career, and how to work with mentors.
```

**Construction:** `LlmGateway.complete(system, historyTurns, userMessage)` builds:

1. `SystemMessage(system)`
2. Prior session turns as `UserMessage` / `AssistantMessage` (excluding the latest user text already passed separately)
3. Final `UserMessage(userMessage)`

History is the persisted `chat_messages` for that session. There is no separate sliding-window trim beyond sending the stored turns.

## P-02 RAG grounding wrapper

**Where:** `RagService.ask`  
**When:** `POST /api/rag/chat`  
**Role:** User (the grounded question is stored as the **user** chat message)

Template:

```text
Use only the context to answer. If missing, say you don't know.

Context:
{chunk1}
---
{chunk2}
---
...

Question: {question}
```

If the user has no chunks: `Context:` is `No documents uploaded yet.`

**Top-K:** 5 chunks by cosine similarity.  
**Chunking (ingestion, not a prompt):** size 800 characters, overlap 120, whitespace normalized.

**Security note:** Retrieved text is concatenated into the user message. The system prompt still sits in the system role, but there is no extra “ignore document instructions” firewall beyond P-01 + P-02 wording.

## P-03 LLM unavailability fallback

**Where:** `LlmGateway.fallback`  
**When:** No `ChatModel` bean or the provider call throws.

```text
I couldn't reach the configured OpenAI-compatible model. Set OPENAI_API_KEY, OPENAI_BASE_URL, and OPENAI_MODEL.

Meanwhile, SkillSync matching weights are: skills 50%, goals 20%, experience 15%, availability 10%, rating 5%.

Your last question: {userMessage}
```

(Implemented with string concatenation, not `String.formatted`, to avoid `%` in user text breaking the reply.)

## P-04 Embedding fallback (not an LLM prompt)

**Where:** `LlmGateway.embed` → `VectorMath.fallbackEmbed(text, 64)`  
**When:** Embedding model missing or API error.  
Produces a 64-dimension hashed vector so RAG still runs offline with reduced quality.

## P-05 Email — password reset

**Where:** `MailService.sendPasswordReset`  
**Subject:** `Reset your SkillSync password`  
**Body:**

```text
Reset link (valid 30 minutes):
{FRONTEND_URL}/reset-password?token={rawToken}
```

Logs record the **subject**, not the raw token.

## P-06 Email — verify account

**Subject:** `Verify your SkillSync email`  
**Body:**

```text
Verify your account:
{FRONTEND_URL}/verify-email?token={rawToken}
```

## P-07 Matching “reasons” (deterministic copy, not LLM)

**Where:** `MatchingEngine.score`  
Examples:

- `Strong {skill1, skill2, skill3} skill overlap`
- `Limited direct skill overlap — complementary mentoring possible`
- `Matches learning goal`
- `Availability compatible`
- `High mentor rating ({rating})`
- `Senior experience gap suitable for mentoring`

These strings are product UX copy returned on `MentorCard.reasons`.

## P-08 Frontend empty / marketing copy (selected)

**Landing AI feature:** “PDF chunking, embeddings, and semantic search without a vector DB.”  
**RAG page subtitle:** “PDF/text chunking, PostgreSQL embeddings, cosine retrieval”  
**FAQ:** matching weights; isolated PostgreSQL databases; OpenAI-compatible keys in env.

## Model configuration (not prompts)

| Setting | Env / default |
| --- | --- |
| Chat model | `OPENAI_MODEL` → `openai.gpt-5-mini` |
| Embedding model | `OPENAI_EMBEDDING_MODEL` → `amazon.titan-embed-text-v1` |
| Base URL | `OPENAI_BASE_URL` → Capgemini Generative Engine `/v1` |
| API key | `OPENAI_API_KEY` (required for live LLM) |

## Prompt inventory summary

| ID | Type | Purpose |
| --- | --- | --- |
| P-01 | System | Persona and mentoring scope |
| P-02 | User wrapper | Grounding + refusal when context missing |
| P-03 | Fallback | Offline / error path |
| P-04 | Vector | Offline embeddings |
| P-05/06 | Email | Account recovery |
| P-07 | UX strings | Explainable matching |
