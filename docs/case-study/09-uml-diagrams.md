# UML Diagrams

## 1. Component diagram

```mermaid
flowchart TB
  UI[frontend-react<br/>Vite :5173]
  GW[api-gateway :8080]
  AUTH[auth-service :8081]
  MATCH[matching-service :8082]
  AI[ai-service :8083]
  PGA[(skillsync_auth)]
  PGM[(skillsync_matching)]
  PGI[(skillsync_ai)]
  LLM[Chat + Embedding APIs]

  UI -->|REST / JWT| GW
  UI -.->|dev bypass some paths| AUTH
  UI -.->|dev bypass| MATCH
  UI -.->|dev bypass| AI
  GW --> AUTH
  GW --> MATCH
  GW --> AI
  AUTH --> PGA
  MATCH --> PGM
  AI --> PGI
  AI --> LLM
```

The frontend `serviceBase()` helper may call 8081/8082/8083 directly in local development while still supporting `VITE_API_BASE_URL=http://localhost:8080`.

## 2. Package diagram (backend)

```mermaid
flowchart LR
  subgraph auth-service
    aw[web]
    as[service]
    ad[domain]
    ar[repository]
    ax[security]
  end
  subgraph matching-service
    mw[web]
    ms[service]
    me[engine]
    md[domain]
  end
  subgraph ai-service
    iw[web]
    is[service]
    ir[rag]
    id[domain]
  end
  aw --> as --> ad
  as --> ar
  aw --> ax
  mw --> ms --> me
  iw --> is --> ir
```

## 3. Class diagram — matching (simplified)

```mermaid
classDiagram
  class Profile {
    Long id
    Long userId
    String fullName
    String learningGoals
    int experienceYears
    Availability availability
  }
  class Skill {
    Long id
    String name
    String category
  }
  class ProfileSkill {
    SkillLevel level
    int progress
  }
  class MentorProfile {
    String headline
    BigDecimal rating
    int reviewCount
    boolean accepting
  }
  class MatchRequest {
    RequestStatus status
    String message
  }
  class Review {
    int rating
    String comment
  }
  class MatchingEngine {
    +score(Profile, MentorProfile) MatchResult
  }
  Profile "1" --> "*" ProfileSkill
  ProfileSkill --> Skill
  MentorProfile --> Profile
  MatchRequest --> Profile : learner
  MatchRequest --> MentorProfile
  Review --> MatchRequest
  MatchingEngine ..> Profile
  MatchingEngine ..> MentorProfile
```

## 4. Class diagram — auth

```mermaid
classDiagram
  class User {
    Long id
    String email
    String passwordHash
    Role role
    boolean enabled
    boolean emailVerified
  }
  class RefreshToken {
    String tokenHash
    Instant expiresAt
    boolean revoked
  }
  class PasswordResetToken {
    String tokenHash
    boolean used
  }
  class EmailVerificationToken {
    String tokenHash
    boolean used
  }
  class AuditLog {
    String action
    String details
    String ipAddress
  }
  User "1" --> "*" RefreshToken
  User "1" --> "*" PasswordResetToken
  User "1" --> "*" EmailVerificationToken
```

## 5. Class diagram — AI / RAG

```mermaid
classDiagram
  class ChatSession {
    Long userId
    String title
  }
  class ChatMessage {
    String role
    String content
  }
  class RagDocument {
    Long userId
    String filename
  }
  class RagChunk {
    int chunkIndex
    String content
    String embedding
  }
  class ChatService {
    +chat(userId, sessionId, text, regenerate)
  }
  class RagService {
    +ingest(userId, file)
    +ask(userId, sessionId, question)
  }
  class LlmGateway {
    +complete(system, history, user)
    +embed(text) double[]
  }
  ChatSession "1" --> "*" ChatMessage
  RagDocument "1" --> "*" RagChunk
  ChatService --> LlmGateway
  RagService --> LlmGateway
  RagService --> ChatService
```

## 6. Sequence — login

```mermaid
sequenceDiagram
  actor U as Browser
  participant GW as Gateway :8080
  participant A as Auth :8081
  participant DB as skillsync_auth
  U->>GW: POST /api/auth/login
  GW->>A: forward
  A->>DB: load user by email
  A->>A: BCrypt matches
  A->>DB: store hashed refresh token
  A-->>U: accessToken, refreshToken, user
```

## 7. Sequence — ranked mentors

```mermaid
sequenceDiagram
  actor U as Learner
  participant M as Matching :8082
  participant DB as skillsync_matching
  U->>M: GET /api/mentors  Authorization Bearer
  M->>DB: learner profile + mentor_profiles
  loop each accepting mentor
    M->>M: MatchingEngine.score
  end
  M-->>U: MentorCard[] sorted by matchScore
```

## 8. Sequence — RAG ask

```mermaid
sequenceDiagram
  actor U as User
  participant AI as ai-service
  participant DB as skillsync_ai
  participant LLM as Embedding + Chat model
  U->>AI: POST /api/rag/chat {question, sessionId}
  AI->>LLM: embed(question)
  AI->>DB: chunks for userId
  AI->>AI: cosine, top 5
  AI->>AI: grounded user prompt
  AI->>LLM: system + history + prompt
  AI->>DB: save chat messages
  AI-->>U: {sessionId, content, role}
```

## 9. Activity — request lifecycle

```mermaid
stateDiagram-v2
  [*] --> PENDING: learner creates request
  PENDING --> ACCEPTED: mentor accepts
  PENDING --> DECLINED: mentor declines
  ACCEPTED --> COMPLETED: session finished
  COMPLETED --> [*]: review submitted
  DECLINED --> [*]
```

## 10. Deployment (local)

```mermaid
flowchart TB
  subgraph Workstation
    B[Browser]
    N[Node Vite]
    J1[JVM auth]
    J2[JVM matching]
    J3[JVM ai]
    J0[JVM gateway]
    PG[PostgreSQL :5432]
  end
  B --> N
  N --> J0
  J0 --> J1
  J0 --> J2
  J0 --> J3
  J1 --> PG
  J2 --> PG
  J3 --> PG
```
