# Problem Statement

## The problem

Learners who want to grow in software engineering struggle to find mentors who actually fit their skills, goals, seniority, and schedule. Existing options fail in four ways:

1. **Discovery is noisy.** Social networks and job boards do not rank mentors by skill overlap or learning goals.
2. **Matching is opaque.** When a platform recommends someone, it rarely explains *why*.
3. **Workflow is incomplete.** There is no first-class path from “this mentor looks good” to request, accept, complete, and review.
4. **Study support is disconnected.** Notes, PDFs, and interview prep live outside the mentoring product, so the AI chatbot (if any) is generic and ungrounded.

## Who is affected

- Early-career engineers seeking structured mentoring.
- Experienced engineers willing to mentor but drowning in misaligned requests.
- Platform operators who cannot audit users, roles, or AI usage.

## Impact if unsolved

- Time wasted on poor-fit mentoring relationships.
- Mentor burnout from low-quality inbound requests.
- Low trust in “AI learning” products that hallucinate instead of using the learner’s materials.

## Problem statement (formal)

**SkillSync must provide a secure, role-based web platform that matches learners to mentors using an explainable weighted model, supports the full mentorship request-and-review lifecycle, and offers an authenticated AI assistant that can answer from the user’s uploaded documents as well as general mentoring guidance.**

## Success criteria

| ID | Criterion |
| --- | --- |
| SC-1 | A learner can register, log in, and maintain a skill profile. |
| SC-2 | Mentor recommendations include a numeric score and reasons. |
| SC-3 | Mentors can accept or decline requests; completed sessions can be reviewed. |
| SC-4 | JWT roles isolate USER, MENTOR, and ADMIN capabilities. |
| SC-5 | Chat sessions persist per user and cannot be read across users. |
| SC-6 | Uploaded documents are chunked, embedded, and retrieved by similarity for RAG answers. |
