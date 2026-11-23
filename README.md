# SkillSync (MERN Stack)

**AI-Powered Peer Learning & Mentor Matching Platform**

Learn Faster. Find Mentors. Grow Smarter.

Full-stack **MERN** implementation: **MongoDB** + **Express.js** + **React 19** + **Node.js**, featuring explainable mentor matching, JWT security, AI assistant chat with streaming (SSE), and RAG document assistance.

---

## 🌟 Tech Stack

| Layer | Technology | Details |
| --- | --- | --- |
| **M** - MongoDB | MongoDB & Mongoose | Flexible document schema with numeric IDs, indexes, auto-seeding |
| **E** - Express.js | Express 4 REST API | Auth, profiles, skills catalog, matching engine, requests, reviews, chat & RAG |
| **R** - React.js | React 19 + TypeScript | Vite, Tailwind CSS, Radix UI, Lucide icons, TanStack React Query, Recharts |
| **N** - Node.js | Node.js v18+ | High-performance asynchronous backend runtime |

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Frontend
npm --prefix frontend-react install

# Backend Server
npm --prefix server install
```

### 2. Start Full Stack (Server + Frontend)
```bash
npm run dev
# or on Windows:
start.cmd
```
- **Frontend**: http://localhost:5173
- **Backend API Gateway**: http://localhost:8080
- **Compatibility Ports**: 8081 (Auth), 8082 (Matching), 8083 (AI)

### 3. Run Individual Services
```bash
# Run backend only:
npm run server

# Run frontend only:
npm run client
```

### 4. Run Tests
```bash
# Run API smoke test suite (all 58 tests):
npm run test:api

# Run Frontend unit tests:
npm test
```

---

## 👥 Demo Accounts

The database is pre-seeded with ready-to-use demo personas:

| Role | Email | Password | Persona |
| --- | --- | --- | --- |
| **Admin** | `admin@skillsync.dev` | `Admin@12345` | Amit Admin |
| **Mentor** | `mentor@skillsync.dev` | `Mentor@12345` | Maya Mentor (Staff Engineer) |
| **Learner** | `user@skillsync.dev` | `User@12345` | Uma User (Frontend Developer) |
| **Mentor** | `leo@skillsync.dev` | `Mentor@12345` | Leo Backend (Distributed Systems) |
| **Mentor** | `priya@skillsync.dev` | `Mentor@12345` | Priya Cloud (DevOps & Kubernetes) |

---

## ⚙️ Architecture & Folder Structure

```
skillsync/
├── server/                   # Express.js + Node.js + MongoDB backend
│   ├── src/
│   │   ├── config/           # MongoDB (db.js) & JWT (jwt.js) configuration
│   │   ├── middleware/       # Auth (JWT) & role authorization
│   │   ├── models/           # Mongoose schemas: User, Profile, Skill, MatchRequest,
│   │   │                     # Review, ChatSession, RagDocument, RagChunk, AuditLog
│   │   ├── routes/           # REST endpoints: auth, profile, skills, mentors,
│   │   │                     # requests, reviews, chat, rag, admin
│   │   ├── services/         # Matching engine, AI chat, RAG vector similarity, seeder
│   │   ├── app.js            # Express app configuration & middleware
│   │   └── index.js          # Server entry point with multi-port listeners
│   └── package.json
│
├── frontend-react/           # React 19 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── features/         # Auth, dashboard, landing, matching, mentors,
│   │   │                     # profile, requests, reviews, skills, admin
│   │   ├── services/         # API integration client services (ai, auth, matching)
│   │   └── lib/              # Axios instance, token store, utilities
│   └── package.json
│
├── scripts/
│   ├── dev.mjs               # Concurrent runner for server & client
│   └── qa-api.mjs            # 58 live integration smoke tests
│
├── start.cmd                 # Quick launcher
├── stop.cmd                  # Process terminator
└── package.json              # Monorepo root scripts
```

---

## 🧠 Explainable Matching Weights

SkillSync calculates mentor compatibility using a transparent 5-signal weighted scoring model:

| Signal | Weight | Logic |
| --- | --- | --- |
| **Skill compatibility** | **50%** | Overlap between learner's wanted skills and mentor's verified skills |
| **Learning goal match** | **20%** | Semantic match against bio, headline, and goals |
| **Experience match** | **15%** | Optimal career seniority gap (2–12 years) |
| **Availability match** | **10%** | Schedule compatibility (Weekdays, Weeknights, Weekends, Flexible) |
| **Mentor rating** | **5%** | Community review score out of 5 stars |

---

## 🤖 AI & RAG Engine

- **Chat with Context Memory**: Multi-turn conversation with memory recall (e.g. user details, mentorship questions).
- **Server-Sent Events (SSE)**: Streaming responses at `/api/chat/stream`.
- **RAG Document Q&A**: Upload PDF, TXT, or MD documents at `/api/rag/documents`. Text is chunked, embedded using deterministic vector math, and queried via cosine similarity with citations.
- **Provider Flexibility**: Works out of the box with intelligent offline fallback, or seamlessly connects to **Google Gemini** or **OpenAI** when `GEMINI_API_KEY` or `OPENAI_API_KEY` is set in `.env`.

---

## 📄 License

MIT
