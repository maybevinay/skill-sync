# UI/UX Mockups

The live UI is the source of truth (`frontend-react`). These wireframes match implemented routes and layout patterns (landing, `AppShell` nav, admin layout, Tailwind cards).

## Design tokens (implemented)

- Accent color for “Sync” wordmark and primary buttons.
- `bg-mesh` landing background.
- Shared `Button`, `Card`, `Input`, `Badge`.
- `PageHeader` + `EmptyState` on app pages.
- Light/dark via `ThemeContext`.

## Information architecture

```text
/                    Landing
/login /register     Auth
/forgot-password
/reset-password
/verify-email
/app                 Dashboard (shell)
  profile, skills, mentors, matches
  requests, reviews, ai, rag, settings
/admin               Admin dashboard
  users, mentors, analytics, reports
```

## Wireframe — Landing

```text
┌──────────────────────────────────────────────────────────┐
│ SkillSync          Features  How it works  FAQ    Login  │
│                                              Get started │
├──────────────────────────────────────────────────────────┤
│  Learn Faster. Find Mentors. Grow Smarter.               │
│  [Create account]  [Sign in]                             │
│                                                          │
│  Feature cards: Matching | Skills | Requests | Admin     │
│  AI: Assistant | RAG | Chat memory                       │
│  Sample mentor scores 94 / 91 / 88                       │
│  FAQ accordion                                           │
└──────────────────────────────────────────────────────────┘
```

## Wireframe — Login / Register

```text
┌──────────────┐
│ Brand        │
│ Email        │
│ Password     │
│ Role (reg)   │
│ [Submit]     │
│ Forgot link  │
└──────────────┘
```

`AuthLayout` centers a card on a calm background.

## Wireframe — App shell

```text
┌─────────┬───────────────────────────────────────────────┐
│ SkillSync│  Page title                         User menu │
│ Dashboard│                                               │
│ Profile  │  Content: cards, tables, charts               │
│ Skills   │                                               │
│ Mentors  │                                               │
│ Matches  │                                               │
│ Requests │                                               │
│ Reviews  │                                               │
│ AI       │                                               │
│ RAG      │                                               │
│ Settings │                                               │
└─────────┴───────────────────────────────────────────────┘
```

Nav labels from `AppShell`: Dashboard, Profile, Skills, Mentors, Matches, Requests, Reviews, AI Assistant, RAG Assistant, Settings.

## Wireframe — Mentors / Matches

```text
┌─────────────────────────────────────────────┐
│ Mentors                                      │
│ ┌────────────┐ ┌────────────┐               │
│ │ Name       │ │ Name       │               │
│ │ Headline   │ │ Headline   │               │
│ │ Score 92   │ │ Score 81   │               │
│ │ Reasons…   │ │ Reasons…   │               │
│ │ [Request]  │ │ [Request]  │               │
│ └────────────┘ └────────────┘               │
└─────────────────────────────────────────────┘
```

Score and reasons come from `MentorCard`.

## Wireframe — AI Assistant

```text
┌────────────┬────────────────────────────────┐
│ Sessions   │  Markdown transcript           │
│ • Spring…  │  User / Assistant bubbles      │
│ • Career…  │                                │
│ [New]      │  [Regenerate]                  │
│            │  ┌──────────────────────────┐  │
│            │  │ Message…        [Send]   │  │
│            │  └──────────────────────────┘  │
└────────────┴────────────────────────────────┘
```

Stream path uses `/api/chat/stream` when enabled in the page.

## Wireframe — RAG Assistant

```text
┌─────────────────────────────────────────────┐
│ RAG Assistant                                │
│ [Choose PDF/TXT] [Upload]                    │
│ Documents: notes.pdf · resume.txt            │
│ Question [Ask]                               │
│ Answer panel (same chat persistence)         │
└─────────────────────────────────────────────┘
```

## Wireframe — Admin

```text
┌──────────┬──────────────────────────────────┐
│ Overview │  KPI cards (users, mentors)      │
│ Users    │  Tables: role, enabled toggles   │
│ Mentors  │  Charts (Recharts)               │
│ Analytics│  Reports                         │
│ Reports  │                                  │
└──────────┴──────────────────────────────────┘
```

Admin routes wrapped in `RequireAuth roles={["ADMIN"]}`.

## UX principles used

| Principle | Application |
| --- | --- |
| Progressive disclosure | Admin separate from `/app` |
| Feedback | API error helper `apiErrorMessage` |
| Empty states | `EmptyState` component |
| Accessibility | Semantic buttons, labeled inputs |
| Consistency | Shared UI kit |

## High-fidelity source

Open `http://localhost:5173` after starting the stack with `start.cmd` or `scripts/start.ps1` (see [`../SETUP.md`](../SETUP.md)). Capture screens for [20-demo-screenshots.md](20-demo-screenshots.md).
