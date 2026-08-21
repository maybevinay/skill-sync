# Demo Screenshots or Recording

This document is the **shot list** for examiners and a place to drop exported images. Start the application with `start.cmd` or `scripts/start.ps1` ([`docs/SETUP.md`](../SETUP.md)), then capture real screens at `http://localhost:5173`.

Suggested folder for binaries (create locally, optional in git):

`docs/case-study/assets/`

## Recording (recommended 3–5 minutes)

1. Landing → Register or Login as `user@skillsync.dev`.
2. Profile: set goals “Spring Boot system design”, add a skill.
3. Mentors: show score + reasons → send request.
4. Logout → login `mentor@skillsync.dev` → accept request.
5. Login user → AI Assistant: ask how matching weights work.
6. RAG: upload a short `.txt` → ask a question answered only in that file.
7. Login `admin@skillsync.dev` → Users + Analytics.

Save as `SkillSync-demo.mp4` or share a private drive link in this section:

```text
Recording URL: ______________________________
Duration: ________
Date: ________
```

## Screenshot checklist

| # | Screen | URL | What to show | File name |
| --- | --- | --- | --- | --- |
| 1 | Landing hero | `/` | Headline, CTAs | `01-landing.png` |
| 2 | Login | `/login` | Form | `02-login.png` |
| 3 | Dashboard | `/app` | Shell + widgets | `03-dashboard.png` |
| 4 | Profile | `/app/profile` | Goals, availability | `04-profile.png` |
| 5 | Skills | `/app/skills` | Catalog / progress | `05-skills.png` |
| 6 | Mentors | `/app/mentors` | Score + reasons | `06-mentors.png` |
| 7 | Matches | `/app/matches` | Ranked list | `07-matches.png` |
| 8 | Requests | `/app/requests` | PENDING/ACCEPTED | `08-requests.png` |
| 9 | Reviews | `/app/reviews` | Rating form | `09-reviews.png` |
| 10 | AI chat | `/app/ai` | Thread + markdown | `10-ai-chat.png` |
| 11 | RAG | `/app/rag` | Upload + answer | `11-rag.png` |
| 12 | Settings | `/app/settings` | Theme / account | `12-settings.png` |
| 13 | Admin home | `/admin` | KPIs | `13-admin.png` |
| 14 | User mgmt | `/admin/users` | Role/enabled | `14-admin-users.png` |
| 15 | Analytics | `/admin/analytics` | Charts | `15-analytics.png` |
| 16 | Swagger auth | `:8081/swagger-ui.html` | OpenAPI | `16-swagger.png` |

## Capture tips

- Browser width ≥ 1280px.
- Use seeded accounts only on local machines.
- Hide any real `OPENAI_API_KEY` from DevTools screenshots.
- For RAG, use a harmless text file, e.g. `SkillSync uses 50% skill overlap for matching.`

## Placeholder gallery

Until PNGs are added, use the wireframes in [16-ui-ux-mockups.md](16-ui-ux-mockups.md) and the live app.

```markdown
![Landing](assets/01-landing.png)
![Mentors](assets/06-mentors.png)
![AI](assets/10-ai-chat.png)
![RAG](assets/11-rag.png)
![Admin](assets/13-admin.png)
```

## Demo data reminder

| Role | Email | Password |
| --- | --- | --- |
| ADMIN | admin@skillsync.dev | Admin@12345 |
| MENTOR | mentor@skillsync.dev | Mentor@12345 |
| USER | user@skillsync.dev | User@12345 |
