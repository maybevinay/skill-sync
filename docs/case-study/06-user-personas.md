# User Personas

## Persona 1 — Uma, the learner (USER)

| Field | Detail |
| --- | --- |
| Name | Uma User |
| Role in product | `USER` |
| Demo account | `user@skillsync.dev` / `User@12345` |
| Age / stage | 24, 2 years as a backend engineer |
| Goals | Get a Spring Boot mentor, close system-design gaps, use RAG on interview notes |
| Frustrations | LinkedIn DMs ignored; generic ChatGPT answers not tied to her notes |
| Skills | Spring Boot (intermediate), React (beginner) |
| Availability | WEEKNIGHTS |
| Quote | “Show me *why* this mentor is 92, not just a list of names.” |

**Primary jobs:** complete profile, browse ranked mentors, send requests, chat with AI, upload PDFs.

## Persona 2 — Maya, the mentor (MENTOR)

| Field | Detail |
| --- | --- |
| Name | Maya Mentor |
| Role in product | `MENTOR` |
| Demo account | `mentor@skillsync.dev` / `Mentor@12345` |
| Age / stage | 34, 8 years backend / platform |
| Goals | Accept high-fit learners only; keep rating honest |
| Frustrations | Requests from people with no overlapping skills |
| Skills | Spring Boot, System Design, Communication |
| Availability | FLEXIBLE |
| Quote | “If the score and reasons don’t match, I won’t accept.” |

**Primary jobs:** publish mentor headline, accept/decline requests, complete sessions, read reviews.

## Persona 3 — Arun, the platform admin (ADMIN)

| Field | Detail |
| --- | --- |
| Name | Arun Admin |
| Role in product | `ADMIN` |
| Demo account | `admin@skillsync.dev` / `Admin@12345` |
| Goals | Disable abusive accounts, retune skill catalog, watch growth |
| Frustrations | No audit trail of role changes |
| Quote | “I need users, mentors, analytics, and AI usage in one console.” |

**Primary jobs:** `/admin` dashboard, user enablement/roles, skill CRUD, analytics, reports, AI stats.

## Persona 4 — Priya, the dual-hat mentor-learner

Mentors still keep a learner `profiles` row. Priya uses USER-like matching when she wants a staff-engineer mentor, and MENTOR mode when she accepts juniors. SkillSync allows this by separating `users.role` from `mentor_profiles`.

## Persona–feature map

| Feature | Uma | Maya | Arun |
| --- | --- | --- | --- |
| Register / login | ✓ | ✓ | seeded |
| Profile & skills | ✓ | ✓ | — |
| Mentor matching | ✓ | (as learner) | — |
| Requests / reviews | ✓ | ✓ | oversee |
| AI chat / RAG | ✓ | ✓ | stats |
| Admin console | — | — | ✓ |
