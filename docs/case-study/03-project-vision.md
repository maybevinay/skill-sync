# Project Vision

## Vision statement

**Learn faster. Find mentors. Grow smarter.**

SkillSync is the operating system for peer learning: every engineer has a living skill graph, every mentor match is explained, and every study session can be grounded in the learner’s own knowledge base.

## Mission

Build a production-oriented SaaS monorepo that demonstrates enterprise patterns — microservices, JWT security, PostgreSQL isolation, explainable matching, and GenAI with RAG — without payments or unnecessary infrastructure.

## Product principles

1. **Explainability over black-box ranking.** Scores always ship with reasons.
2. **Least privilege.** Auth, matching, and AI data never share one database.
3. **Roles are first-class.** USER, MENTOR, and ADMIN see different surfaces.
4. **AI is assistive, not authoritative.** RAG must prefer retrieved context and admit gaps.
5. **Local-first developer experience.** JDK 21, Maven, Node 20, PostgreSQL on localhost.

## Target experience (north star)

A learner opens SkillSync, completes a profile, sees ranked mentors with reasons such as “Strong Spring Boot skill overlap”, requests a mentor, chats with an AI coach about career strategy, uploads interview notes, and asks grounded questions — while an admin monitors growth and audit logs.

## Strategic non-goals

- Replacing human mentors with AI.
- Building a marketplace with payments in this version.
- Operating a separate vector database (Pinecone, Weaviate, etc.).
- Shipping Docker/Kubernetes as a requirement for local development.

## Horizon

| Horizon | Intent |
| --- | --- |
| Now | Working local platform with matching, reviews, chat, RAG, admin. |
| Next | Stronger RAG (thresholding, citations, pgvector), richer analytics. |
| Later | Scheduling, notifications at scale, production TLS and secret management. |
