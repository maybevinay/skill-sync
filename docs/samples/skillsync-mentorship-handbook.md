# SkillSync Mentorship Handbook (RAG sample)

Document ID: SS-HANDBOOK-2026-A
Last updated: 21 August 2026
Audience: learners, mentors, and the SkillSync RAG Assistant

Use this file on RAG Assistant (`/app/rag`). Upload it, then ask questions that only this handbook answers. If the assistant cites this filename and repeats the unique codes below, retrieval is working.

## What SkillSync is

SkillSync is a peer learning and mentorship platform. Learners find mentors by skill overlap, learning goals, experience band, weekly availability, and mentor rating. Mentors accept or decline requests. After a successful engagement, the learner can leave one review.

SkillSync does not replace a university degree. It is a structured way to practice with a human mentor and an AI assistant that can read your notes.

## Matching formula (source of truth)

Mentor ranking uses a weighted score. The live weights are:

- Skills overlap: 50 percent
- Learning goals overlap: 20 percent
- Experience proximity: 15 percent
- Availability overlap: 10 percent
- Mentor rating: 5 percent

A mentor who shares your stack but has a weak rating can still outrank a highly rated mentor in a different domain, because skills are half the score.

The recommendation list is personal. Two learners with different skills will not see the same order.

## Seeded skill catalog

The matching catalog includes Spring Boot, React, TypeScript, MySQL, System Design, Machine Learning, Python, Docker, Kubernetes, and Communication.

If your profile has no skills, match scores stay low even when a mentor looks like a good fit. Add at least three skills with a level before you browse mentors.

## Request lifecycle

A mentorship request has exactly four statuses: PENDING, ACCEPTED, DECLINED, and COMPLETED.

Rules:

- Only a learner can create a request. You cannot request yourself.
- Include a short message that names the skill and the outcome you want in 30 days.
- Only the mentor can Accept or Decline a PENDING request. The learner cannot accept on the mentor's behalf.
- Either side can mark an ACCEPTED request as COMPLETED when the agreed work is done.
- A DECLINED request is closed. Send a new request later if the mentor is still accepting learners.

Policy code for this section: SS-REQ-LIFECYCLE-04.

## Reviews

Reviews are allowed only on ACCEPTED or COMPLETED requests. One review per request. The review includes a 1–5 rating and a comment.

The learner writes the review. Mentor rating and review count on the mentor card are recalculated from those reviews.

Empty comments are rejected. Write at least one sentence about what you practiced.

Policy code for this section: SS-REV-ONCE-01.

## Demo accounts for local testing

These accounts exist only on a local SkillSync database after seeding:

- Admin user id: 1. Email: admin@skillsync.dev. Password: Admin@12345
- Mentor user id: 2. Email: mentor@skillsync.dev. Password: Mentor@12345
- Learner user id: 3. Email: user@skillsync.dev. Password: User@12345

The seeded admin id is 1. The admin login is admin@skillsync.dev.

Uma (learner) and Maya (mentor) have a seeded ACCEPTED request so the learner can submit a review without waiting for a new match.

Do not use these passwords outside local development.

## Profile rules for new signups

A new registration starts with a blank matching profile. Name comes from the account. Bio, links, GitHub, country, and skills start empty.

Demo mentor profiles for Leo and Priya Cloud use reserved user ids 9004 and 9005 so they never collide with a real signup. If you just registered and saw a DevOps bio you did not write, that was the old collision; it is fixed.

## Aurora 12-week Java track

Internal program name: Aurora Track.
Program code: AURORA-JAVA-12.

Week 1–2: Git, Maven, JUnit, and a Spring Boot hello service on port 8080.
Week 3–4: REST controllers, DTOs, validation, and PostgreSQL with Flyway.
Week 5–6: JWT login, roles USER and MENTOR, and a gateway on port 8080.
Week 7–8: React profile page, skill chips, and mentor cards with match percent.
Week 9–10: Mentorship requests, accept/decline, and reviews.
Week 11: AI chat with Gemini. Default chat model name in this handbook: gemini-3.6-flash.
Week 12: RAG upload. Chunk size 800 characters, overlap 120 characters, retrieve top 5 chunks, cosine floor 0.28.

Capstone artifact: a 3-minute demo of match, request, review, chat, and RAG citation.

Office hours for Aurora Track mentors: Tuesday 19:00 IST and Saturday 10:00 IST. Meeting room name: Nimbus-4.

## How to work with a mentor (learner playbook)

Before the first session, send: current role, one goal for 30 days, and a link to a repo or notes file.

During a session, screen-share one problem for 25 minutes. Do not recap your whole career.

After a session, write three bullets: what you built, what blocked you, what you will try before next week. Upload those notes to RAG Assistant so later questions can be grounded.

Session length default: 45 minutes. Cancel with 12 hours notice using request message, not email.

Learner pledge code: SS-LEARN-45.

## How to mentor on SkillSync (mentor playbook)

Keep Accepting learners on if you can take at least one new request this month.

When a request arrives, reply within 48 hours. Accept only if you can name a first exercise in the accept message.

Do not rewrite the learner's code for them. Review a pull request, ask one question, and leave the next change to them.

If the learner goes quiet for 14 days, mark the request COMPLETED and leave a kind note. Do not leave it PENDING forever.

Mentor pledge code: SS-MENTOR-07.

## RAG Assistant usage

Open RAG Assistant from the app nav (`/app/rag`). Supported uploads: PDF, TXT, Markdown, HTML.

The pipeline is: extract text, split into chunks of 800 characters with 120-character overlap, embed at 1536 dimensions, store in PostgreSQL (`skillsync_ai`), then on ask retrieve the top 5 similar chunks for your user id only.

Other users cannot see your documents. Admin stats may show a document count, not the file contents.

If the answer says it does not know, the question did not match any chunk above similarity 0.28. Rephrase with words that appear in the file, such as AURORA-JAVA-12 or SS-REQ-LIFECYCLE-04.

Grounding rule: the assistant must answer from retrieved context. It should not invent matching weights that are not 50 / 20 / 15 / 10 / 5.

## Suggested questions to verify this document

Ask these after upload:

1. What are the SkillSync matching weights?
2. What is the admin id?
3. What is program code AURORA-JAVA-12 and when are office hours?
4. Can a learner accept their own mentorship request?
5. When am I allowed to submit a review, and how many reviews per request?
6. What is mentor pledge code SS-MENTOR-07?
7. What chunk size and top-K does RAG use?

Expected unique strings in good answers: 50 percent skills, AURORA-JAVA-12, Tuesday 19:00 IST, SS-REV-ONCE-01, Nimbus-4.

## Local service map

| Surface | Port |
| --- | --- |
| Web UI | 5173 |
| API gateway | 8080 |
| Auth | 8081 |
| Matching | 8082 |
| AI / RAG | 8083 |
| Eureka dashboard | 8761 |
| PostgreSQL | 5432 |

Databases: skillsync_auth, skillsync_matching, skillsync_ai. RAG vectors live in skillsync_ai.

## Safety and privacy

Do not paste production secrets, other people's resumes, or live API keys into a RAG upload. This handbook is demo content.

Password reset links expire in 30 minutes. Role ADMIN cannot be chosen at self-registration.

End of handbook. Document ID SS-HANDBOOK-2026-A.
