# Non-Functional Requirements

## NFR-1 Security

| ID | Requirement | How met |
| --- | --- | --- |
| NFR-1.1 | Stateless JWT (HS256), shared secret across gateway and services. | `JWT_SECRET` |
| NFR-1.2 | Passwords stored with BCrypt. | `PasswordEncoder` |
| NFR-1.3 | Refresh and reset tokens stored hashed (SHA-256), not plaintext. | Auth service |
| NFR-1.4 | CORS allowlist for the Vite origin. | Gateway + services |
| NFR-1.5 | Rate limit ~120 requests/minute at gateway. | `RateLimitFilter` |
| NFR-1.6 | Role-based access; `/api/admin/**` requires ADMIN. | Spring Security |
| NFR-1.7 | Secrets in `.env` (gitignored); example file committed without live API keys. | `.gitignore` |

## NFR-2 Reliability and availability (local/dev)

| ID | Requirement | How met |
| --- | --- | --- |
| NFR-2.1 | Services start independently; Flyway migrates on boot. | Each Spring app |
| NFR-2.2 | LLM failure does not crash chat; fallback text is returned. | `LlmGateway` |
| NFR-2.3 | Mail failure is logged and skipped so auth still works. | `MailService` |
| NFR-2.4 | Actuator health on gateway. | `/actuator/health` |

## NFR-3 Performance

| ID | Requirement | Notes |
| --- | --- | --- |
| NFR-3.1 | Matching is in-process over mentor list (suitable for demo scale). | No external search cluster |
| NFR-3.2 | RAG cosine is computed in application memory over the user’s chunks. | Fine for personal document sets |
| NFR-3.3 | Multipart uploads capped at 15 MB on AI service. | `application.yml` |

## NFR-4 Scalability (architecture readiness)

- Horizontal: gateway routes to independently deployable services.
- Data: three PostgreSQL databases for bounded-context isolation.
- Not included: clustering, Redis, message bus.

## NFR-5 Maintainability

- Java 21, Spring Boot 3.3.5, Flyway SQL migrations.
- OpenAPI / Swagger UI per service.
- Postman collection for manual API tests.
- Unit and MockMvc tests in each backend module; Vitest on frontend.

## NFR-6 Usability

- Responsive Tailwind UI, landing marketing page, dark/light theme context.
- Empty states and page headers on app screens.
- Chat UI supports markdown rendering.

## NFR-7 Portability

- Windows/macOS/Linux with JDK 21, Maven, Node 20, PostgreSQL 16+.
- OpenAI-compatible LLM (Capgemini, OpenAI, Groq, Ollama `/v1`).

## NFR-8 Observability

- Service logs (INFO); mail logs subject only (not reset tokens).
- Audit log table for auth actions with optional IP.
- `ai_usage` token estimates for chat.

## NFR-9 Compliance / privacy (application-level)

- Chat sessions and RAG documents filtered by `userId`.
- Cross-user session access returns 404 (`ChatService.get`).
- No payment or PII beyond profile fields and email.

## Quality attributes summary

| Attribute | Target (this delivery) |
| --- | --- |
| Confidentiality | JWT + BCrypt + hashed tokens |
| Integrity | JPA validation, unique emails/skills |
| Availability | Local multi-process; LLM optional |
| Explainability | Match reasons always returned |
| Testability | JUnit 5 + MockMvc + Vitest |
