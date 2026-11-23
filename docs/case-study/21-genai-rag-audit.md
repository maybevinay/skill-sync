# GenAI / RAG Audit (as implemented)

This record matches the code after the pgvector / grounding hardening. It is not a redesign of matching or auth.

## Pipeline

```text
Document → ingest → extract (PDF/TXT/MD/HTML) → chunk 800/120
  → metadata (user, filename, chunk index) → embed 1536-d
  → PostgreSQL rag_chunks (pgvector when the extension is installed)
  → query embed → cosine top-K + threshold → CONTEXT + question
  → chat history (visible user text only) → LLM → answer + sources
```

## Reranking

Not added. Each user keeps a small personal corpus; a second ranking model would add latency and another dependency without a measured quality gain at this scale.

## Remaining verification

Live `localhost:5432` + `CREATE EXTENSION vector` must be confirmed on the developer machine. H2 tests use in-process cosine.
