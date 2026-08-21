# Test Cases

IDs map to automated tests where they exist. Status: **Automated** or **Manual**.

## TC-AUTH

| ID | Title | Steps | Expected | Type |
| --- | --- | --- | --- | --- |
| TC-A01 | Login seeded learner | POST `/api/auth/login` user@skillsync.dev / User@12345 | 200, accessToken, email | Automated `loginSeededLearner` |
| TC-A02 | Duplicate register | Register existing email | 409 | Automated `registerRejectsDuplicate` |
| TC-A03 | Duplicate email service | `AuthService.register` twice | Conflict | Automated |
| TC-A04 | Admin role coerced | Register role ADMIN | Stored as USER | Automated `registerCoercesAdminRoleToUser` |
| TC-A05 | Unknown email login | Random email | Error | Automated |
| TC-A06 | Disabled account | enabled=false login | Rejected | Automated |
| TC-A07 | Happy login service | Enabled user | Tokens | Automated |
| TC-A08 | SHA-256 stable | Hash same string twice | Equal | Automated |
| TC-A09 | JWT sign/verify | JwtServiceTest | Valid claims | Automated |
| TC-A10 | Refresh after expiry | Wait / use refresh | New access | Manual |
| TC-A11 | Forgot password email | POST forgot-password | 200; mail or log | Manual |
| TC-A12 | Reset with bad token | Invalid token | 4xx | Manual |

## TC-GW

| ID | Title | Expected | Type |
| --- | --- | --- | --- |
| TC-G01 | Login path public | Allowed without JWT | Automated `loginIsPublic` |
| TC-G02 | Protected without JWT | 401 | Automated |
| TC-G03 | OPTIONS forwarded | No JWT required | Automated |
| TC-G04 | Burst > 120/min | Limited | Automated `RateLimitFilterTest` |

## TC-MATCH

| ID | Title | Expected | Type |
| --- | --- | --- | --- |
| TC-M01 | Overlapping Spring skills | High score + reasons | Automated MatchingEngineTest |
| TC-M02 | Empty profile completion | Baseline score | Automated |
| TC-M03 | Filled profile | Higher completion | Automated |
| TC-M04 | Skills raise completion | Increase | Automated |
| TC-M05 | Duplicate skill name | Create rejected | Automated |
| TC-M06 | Delete missing skill | 404 | Automated |
| TC-M07 | New mentor rating 0 | Zero rating | Automated |
| TC-M08 | Learner cannot accept own request | Rejected | Automated |
| TC-M09 | Mentor accepts PENDING | ACCEPTED | Automated |
| TC-M10 | Stranger cannot PATCH request | Rejected | Automated |
| TC-M11 | Cannot request self | Rejected | Automated |
| TC-M12 | Duplicate review | Rejected | Automated |
| TC-M13 | Rating out of range | Rejected | Automated |

## TC-AI

| ID | Title | Expected | Type |
| --- | --- | --- | --- |
| TC-I01 | Foreign session GET | 404 | Automated `getRejectsSessionOwnedBySomeoneElse` |
| TC-I02 | Blank chat message | 400 | Automated |
| TC-I03 | Null message | 400 | Automated |
| TC-I04 | Cosine identical vectors | 1.0 | Automated |
| TC-I05 | Embedding JSON round-trip | Equal vector | Automated |
| TC-I06 | Chunk 800/120 | ≥3 windows, first len 800 | Automated |
| TC-I07 | Empty chunk input | No throw | Automated |
| TC-I08 | Upload PDF ingest | chunks > 0 | Manual / integration |
| TC-I09 | RAG ask with docs | Answer uses context | Manual |
| TC-I10 | RAG with no docs | Don’t-know style / fallback | Manual |
| TC-I11 | Chat without API key | Fallback mentions weights | Manual |

## TC-FE

| ID | Title | Type |
| --- | --- | --- |
| TC-F01 | `serviceBase` routes AI/matching/auth hosts | Vitest `api.test.ts` |
| TC-F02 | Auth helper tests | Vitest `auth.test.ts` |
| TC-F03 | `cn` class merge | Vitest `cn.test.ts` |
| TC-F04 | Login UI invalid password | Manual |
| TC-F05 | Non-admin visits `/admin` | Redirect / blocked |
| TC-F06 | Mentors page shows scores | Manual |
| TC-F07 | Theme toggle | Manual |

## TC-SEC (manual)

| ID | Title | Expected |
| --- | --- | --- |
| TC-S01 | USER calls `/api/admin/users` | 403 |
| TC-S02 | Tampered JWT | 401 |
| TC-S03 | RAG docs of user A as user B | Empty / not listed |
| TC-S04 | `.env` not in git | gitignored |

## Traceability

| Requirement | Tests |
| --- | --- |
| FR-1 Auth | TC-A*, TC-G* |
| FR-3 Matching | TC-M01 |
| FR-4 Requests | TC-M08–M13 |
| FR-5 Chat | TC-I01–I03, I11 |
| FR-6 RAG | TC-I04–I10 |
| FR-7 Admin | TC-S01, TC-F05 |
| NFR isolation | TC-I01, TC-S03 |
