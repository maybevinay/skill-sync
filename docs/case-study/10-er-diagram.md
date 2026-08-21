# ER Diagram

SkillSync uses **three PostgreSQL databases**. There are no cross-database foreign keys. `user_id` in matching and AI is a logical reference to `users.id` in auth.

## Conceptual model

```mermaid
erDiagram
  USERS ||--o{ REFRESH_TOKENS : has
  USERS ||--o{ PASSWORD_RESET_TOKENS : has
  USERS ||--o{ EMAIL_VERIFICATION_TOKENS : has
  USERS ||--o{ AUDIT_LOGS : may_actor

  PROFILES ||--o{ PROFILE_SKILLS : has
  SKILLS ||--o{ PROFILE_SKILLS : tagged
  PROFILES ||--o| MENTOR_PROFILES : optional
  PROFILES ||--o{ MATCH_REQUESTS : sends
  MENTOR_PROFILES ||--o{ MATCH_REQUESTS : receives
  MATCH_REQUESTS ||--o| REVIEWS : may_have
  PROFILES ||--o{ REVIEWS : writes
  MENTOR_PROFILES ||--o{ REVIEWS : receives

  CHAT_SESSIONS ||--o{ CHAT_MESSAGES : contains
  RAG_DOCUMENTS ||--o{ RAG_CHUNKS : split_into
```

## Database: `skillsync_auth`

```mermaid
erDiagram
  USERS {
    bigint id PK
    varchar full_name
    varchar email UK
    varchar password_hash
    varchar role
    boolean enabled
    boolean email_verified
    timestamp created_at
    timestamp updated_at
  }
  REFRESH_TOKENS {
    bigint id PK
    bigint user_id FK
    varchar token_hash UK
    timestamp expires_at
    boolean revoked
  }
  PASSWORD_RESET_TOKENS {
    bigint id PK
    bigint user_id FK
    varchar token_hash UK
    timestamp expires_at
    boolean used
  }
  EMAIL_VERIFICATION_TOKENS {
    bigint id PK
    bigint user_id FK
    varchar token_hash UK
    timestamp expires_at
    boolean used
  }
  AUDIT_LOGS {
    bigint id PK
    bigint actor_id
    varchar action
    varchar details
    varchar ip_address
    timestamp created_at
  }
  USERS ||--o{ REFRESH_TOKENS : user_id
  USERS ||--o{ PASSWORD_RESET_TOKENS : user_id
  USERS ||--o{ EMAIL_VERIFICATION_TOKENS : user_id
```

Flyway: `backend/auth-service/src/main/resources/db/migration/V1__init_auth.sql`

## Database: `skillsync_matching`

```mermaid
erDiagram
  SKILLS {
    bigint id PK
    varchar name UK
    varchar category
    varchar description
  }
  PROFILES {
    bigint id PK
    bigint user_id UK
    varchar full_name
    varchar photo_url
    varchar bio
    varchar learning_goals
    int experience_years
    varchar availability
    varchar country
    timestamp created_at
  }
  PROFILE_SKILLS {
    bigint id PK
    bigint profile_id FK
    bigint skill_id FK
    varchar level
    int progress
  }
  MENTOR_PROFILES {
    bigint id PK
    bigint profile_id UK
    varchar headline
    decimal rating
    int review_count
    boolean accepting
  }
  MATCH_REQUESTS {
    bigint id PK
    bigint learner_id FK
    bigint mentor_id FK
    varchar message
    varchar status
    timestamp created_at
  }
  REVIEWS {
    bigint id PK
    bigint request_id UK
    bigint reviewer_id FK
    bigint mentor_id FK
    int rating
    varchar comment
  }
  SKILLS ||--o{ PROFILE_SKILLS : skill_id
  PROFILES ||--o{ PROFILE_SKILLS : profile_id
  PROFILES ||--o| MENTOR_PROFILES : profile_id
  PROFILES ||--o{ MATCH_REQUESTS : learner_id
  MENTOR_PROFILES ||--o{ MATCH_REQUESTS : mentor_id
  MATCH_REQUESTS ||--o| REVIEWS : request_id
```

Unique `(profile_id, skill_id)` on `profile_skills`.  
Flyway: `V1__init_matching.sql` + `V2__seed_skills.sql`

## Database: `skillsync_ai`

```mermaid
erDiagram
  CHAT_SESSIONS {
    bigint id PK
    bigint user_id
    varchar title
    timestamp created_at
    timestamp updated_at
  }
  CHAT_MESSAGES {
    bigint id PK
    bigint session_id FK
    varchar role
    text content
    timestamp created_at
  }
  RAG_DOCUMENTS {
    bigint id PK
    bigint user_id
    varchar filename
    varchar content_type
    timestamp created_at
  }
  RAG_CHUNKS {
    bigint id PK
    bigint document_id FK
    int chunk_index
    text content
    text embedding
  }
  AI_USAGE {
    bigint id PK
    bigint user_id
    varchar kind
    int tokens
    timestamp created_at
  }
  CHAT_SESSIONS ||--o{ CHAT_MESSAGES : session_id
  RAG_DOCUMENTS ||--o{ RAG_CHUNKS : document_id
```

`embedding` is a JSON array of doubles (TEXT), not a native `vector` type.

## Enumerations (application-enforced)

| Enum | Values |
| --- | --- |
| Role | USER, MENTOR, ADMIN |
| Availability | WEEKDAYS, WEEKNIGHTS, WEEKENDS, FLEXIBLE |
| SkillLevel | (JPA enum on profile skills) |
| RequestStatus | PENDING, ACCEPTED, DECLINED, COMPLETED |
| Chat role | `user`, `assistant` |
