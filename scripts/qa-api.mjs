/**
 * Live API smoke tests against running SkillSync services.
 * Run: node scripts/qa-api.mjs
 */
const AUTH = "http://localhost:8081";
const MATCH = "http://localhost:8082";
const AI = "http://localhost:8083";
const GW = "http://localhost:8080";

const results = [];

async function req(method, url, { token, body, headers } = {}) {
  const h = { ...(headers || {}) };
  if (body !== undefined && !h["Content-Type"] && !(body instanceof FormData)) {
    h["Content-Type"] = "application/json";
  }
  if (token) h.Authorization = `Bearer ${token}`;
  const res = await fetch(url, {
    method,
    headers: h,
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  return { status: res.status, json, text };
}

function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
}

async function main() {
  check("auth health", (await req("GET", AUTH + "/actuator/health")).json?.status === "UP");
  check("match health", (await req("GET", MATCH + "/actuator/health")).json?.status === "UP");
  check("ai health", (await req("GET", AI + "/actuator/health")).json?.status === "UP");
  check("gw health", (await req("GET", GW + "/actuator/health")).json?.status === "UP");

  const unauthMe = await req("GET", AUTH + "/api/auth/me");
  check("unauth /me is 401", unauthMe.status === 401);

  const unauthProfile = await req("GET", MATCH + "/api/profile/me");
  check("unauth profile is 401", unauthProfile.status === 401);

  const unauthChat = await req("POST", AI + "/api/chat", { body: { message: "hi" } });
  check("unauth chat is 401", unauthChat.status === 401);

  const gwNoToken = await req("GET", GW + "/api/profile/me");
  check("gateway unauth is 401", gwNoToken.status === 401);

  const badPass = await req("POST", AUTH + "/api/auth/login", {
    body: { email: "user@skillsync.dev", password: "wrong-password" },
  });
  check("wrong password 401", badPass.status === 401, String(badPass.json?.message || ""));

  const missing = await req("POST", AUTH + "/api/auth/login", {
    body: { email: "nobody@skillsync.dev", password: "User@12345" },
  });
  check("unknown email 401", missing.status === 401);

  const emptyLogin = await req("POST", AUTH + "/api/auth/login", { body: { email: "", password: "" } });
  check("empty login 400", emptyLogin.status === 400);

  const badEmail = await req("POST", AUTH + "/api/auth/login", {
    body: { email: "not-an-email", password: "User@12345" },
  });
  check("invalid email 400", badEmail.status === 400);

  const malformed = await req("POST", AUTH + "/api/auth/login", {
    headers: { "Content-Type": "application/json" },
    body: undefined,
  });
  const mal2 = await fetch(AUTH + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{",
  });
  check("malformed JSON 400", mal2.status === 400);

  const userLogin = await req("POST", AUTH + "/api/auth/login", {
    body: { email: "user@skillsync.dev", password: "User@12345" },
  });
  check("user login 200", userLogin.status === 200 && !!userLogin.json?.accessToken);
  const userToken = userLogin.json?.accessToken;
  const userId = userLogin.json?.user?.id;

  const mentorLogin = await req("POST", AUTH + "/api/auth/login", {
    body: { email: "mentor@skillsync.dev", password: "Mentor@12345" },
  });
  check("mentor login 200", mentorLogin.status === 200);
  const mentorToken = mentorLogin.json?.accessToken;

  const adminLogin = await req("POST", AUTH + "/api/auth/login", {
    body: { email: "admin@skillsync.dev", password: "Admin@12345" },
  });
  check("admin login 200", adminLogin.status === 200);
  const adminToken = adminLogin.json?.accessToken;

  const gwLogin = await req("POST", GW + "/api/auth/login", {
    body: { email: "user@skillsync.dev", password: "User@12345" },
  });
  check("gateway login 200", gwLogin.status === 200 && !!gwLogin.json?.accessToken);
  const gwToken = gwLogin.json?.accessToken;

  const me = await req("GET", AUTH + "/api/auth/me", { token: userToken });
  check("auth me 200", me.status === 200 && me.json?.email === "user@skillsync.dev");

  const adminAsUser = await req("GET", AUTH + "/api/admin/users", { token: userToken });
  check("user cannot list users 403", adminAsUser.status === 403);

  const adminUsers = await req("GET", AUTH + "/api/admin/users", { token: adminToken });
  check("admin users 200", adminUsers.status === 200 && Array.isArray(adminUsers.json));

  const dup = await req("POST", AUTH + "/api/auth/register", {
    body: { fullName: "Dup", email: "user@skillsync.dev", password: "Password1!", role: "USER" },
  });
  check("duplicate email 409", dup.status === 409);

  const weak = await req("POST", AUTH + "/api/auth/register", {
    body: { fullName: "A", email: "x@y.z", password: "short", role: "USER" },
  });
  check("weak/short register 400", weak.status === 400);

  const adminRole = await req("POST", AUTH + "/api/auth/register", {
    body: {
      fullName: "Would Be Admin",
      email: `qa-admin-${Date.now()}@skillsync.dev`,
      password: "Password1!",
      role: "ADMIN",
    },
  });
  check("register ADMIN coerced to USER", adminRole.status === 201 && adminRole.json?.user?.role === "USER");

  const profile = await req("GET", MATCH + "/api/profile/me", { token: userToken });
  check("profile me 200", profile.status === 200 && profile.json?.userId === userId);

  const gwProfile = await req("GET", GW + "/api/profile/me", { token: gwToken });
  check("gateway profile 200", gwProfile.status === 200);

  const skills = await req("GET", MATCH + "/api/skills", { token: userToken });
  check("skills catalog 200", skills.status === 200 && Array.isArray(skills.json) && skills.json.length > 0);
  const skillId = skills.json[0].id;

  const createSkillAsUser = await req("POST", MATCH + "/api/skills", {
    token: userToken,
    body: { name: "Hacking", category: "x", description: "nope" },
  });
  check("user cannot create catalog skill 403", createSkillAsUser.status === 403);

  const addSkill = await req("POST", MATCH + "/api/profile/me/skills", {
    token: userToken,
    body: { skillId, level: "INTERMEDIATE", progress: 40 },
  });
  check("add profile skill 200 or 409", addSkill.status === 200 || addSkill.status === 409, String(addSkill.status));

  const saveProfile = await req("PUT", MATCH + "/api/profile/me", {
    token: userToken,
    body: {
      fullName: "Uma User",
      photoUrl: "",
      bio: "QA learner",
      learningGoals: "Java, Spring Boot",
      experienceYears: 2,
      availability: "WEEKNIGHTS",
      country: "India",
      linkedinUrl: "",
      githubUrl: "",
      portfolioUrl: "",
    },
  });
  check("save profile 200", saveProfile.status === 200);

  const badAvail = await req("PUT", MATCH + "/api/profile/me", {
    token: userToken,
    body: { fullName: "Uma", learningGoals: "x", experienceYears: 1, availability: "SOMEDAY" },
  });
  check("invalid availability 400", badAvail.status === 400);

  const negYears = await req("PUT", MATCH + "/api/profile/me", {
    token: userToken,
    body: { fullName: "Uma User", learningGoals: "Java", experienceYears: -3, availability: "WEEKNIGHTS" },
  });
  check("negative experience years 400", negYears.status === 400);

  const mentors = await req("GET", MATCH + "/api/mentors", { token: userToken });
  check("mentors list 200", mentors.status === 200 && Array.isArray(mentors.json));
  const mentorId = mentors.json?.[0]?.mentorId;

  const recs = await req("GET", MATCH + "/api/mentors/recommendations", { token: userToken });
  check("recommendations 200", recs.status === 200 && Array.isArray(recs.json));

  const matchOne = mentorId
    ? await req("GET", MATCH + `/api/mentors/${mentorId}/match`, { token: userToken })
    : { status: 0 };
  check("mentor match score 200", !mentorId || matchOne.status === 200);

  const fakeMentor = await req("POST", MATCH + "/api/requests", {
    token: userToken,
    body: { mentorId: 999999, message: "hello" },
  });
  check("invalid mentor 404", fakeMentor.status === 404);

  const missingMentor = await req("POST", MATCH + "/api/requests", {
    token: userToken,
    body: { message: "hello" },
  });
  check("missing mentorId 400", missingMentor.status === 400);

  let createdReq = null;
  if (mentorId) {
    const first = await req("POST", MATCH + "/api/requests", {
      token: userToken,
      body: { mentorId, message: "I'd like to learn from you." },
    });
    createdReq = first.status === 200 || first.status === 201 ? first.json : null;
    check("create request 200/201 or existing 409", [200, 201, 409].includes(first.status), String(first.status));
    const second = await req("POST", MATCH + "/api/requests", {
      token: userToken,
      body: { mentorId, message: "Again" },
    });
    check("duplicate open request 409", second.status === 409, String(second.status) + " " + (second.json?.message || ""));
  } else {
    check("create request skipped", false, "no mentors");
  }

  const requests = await req("GET", MATCH + "/api/requests", { token: userToken });
  check("list requests 200", requests.status === 200 && Array.isArray(requests.json));
  const someId = createdReq?.id || requests.json?.[0]?.id;

  if (someId) {
    const learnerAccept = await req("PATCH", MATCH + `/api/requests/${someId}?status=ACCEPTED`, { token: userToken });
    check("learner cannot accept 403", learnerAccept.status === 403, String(learnerAccept.json?.message || learnerAccept.status));

    const stranger = await req("PATCH", MATCH + `/api/requests/${someId}?status=DECLINED`, { token: adminToken });
    check("admin can update or 200", [200, 400].includes(stranger.status), String(stranger.status));

    const badStatus = await req("PATCH", MATCH + `/api/requests/${someId}?status=NOPE`, { token: userToken });
    check("invalid status 400", badStatus.status === 400);
  }

  const reviews = await req("GET", MATCH + "/api/reviews", { token: userToken });
  check("reviews 200", reviews.status === 200);

  const analyticsUser = await req("GET", MATCH + "/api/admin/analytics", { token: userToken });
  check("user analytics 403", analyticsUser.status === 403);

  const analyticsAdmin = await req("GET", MATCH + "/api/admin/analytics", { token: adminToken });
  check("admin analytics 200", analyticsAdmin.status === 200);

  const idorSession = await req("GET", AI + "/api/chat/sessions/999999", { token: userToken });
  check("missing chat session 404", idorSession.status === 404);

  const emptyChat = await req("POST", AI + "/api/chat", { token: userToken, body: { message: "   " } });
  check("empty chat 400", emptyChat.status === 400);

  const chat = await req("POST", AI + "/api/chat", {
    token: userToken,
    body: { message: "My name is Amit. Reply with one short sentence." },
  });
  check("chat 200", chat.status === 200 && typeof chat.json?.content === "string", chat.json?.content?.slice(0, 80));
  const sessionId = chat.json?.sessionId;

  if (sessionId) {
    const mem = await req("POST", AI + "/api/chat", {
      token: userToken,
      body: { sessionId, message: "What is my name? Answer with just the name." },
    });
    const content = String(mem.json?.content || "");
    check("chat memory recalls Amit", mem.status === 200 && /amit/i.test(content), content.slice(0, 120));
    const view = await req("GET", AI + `/api/chat/sessions/${sessionId}`, { token: userToken });
    check("session view 200", view.status === 200 && Array.isArray(view.json?.messages));

    const other = await req("GET", AI + `/api/chat/sessions/${sessionId}`, { token: mentorToken });
    check("chat session IDOR 404", other.status === 404);
  }

  const ragEmpty = await req("POST", AI + "/api/rag/chat", { token: userToken, body: { question: "" } });
  check("empty RAG question 400", ragEmpty.status === 400, String(ragEmpty.status) + " " + (ragEmpty.json?.message || ""));

  const ragAsk = await req("POST", AI + "/api/rag/chat", {
    token: userToken,
    body: { question: "What is the mentorship handbook about?" },
  });
  check(
    "RAG ask 200",
    ragAsk.status === 200 && typeof ragAsk.json?.content === "string" && typeof ragAsk.json?.grounded === "boolean",
    `grounded=${ragAsk.json?.grounded} reason=${ragAsk.json?.retrievalReason || ""}`,
  );

  const docs = await req("GET", AI + "/api/rag/documents", { token: userToken });
  check("RAG docs 200", docs.status === 200 && Array.isArray(docs.json));

  const gwChat = await req("GET", GW + "/api/chat/sessions", { token: gwToken });
  check("gateway chat sessions 200", gwChat.status === 200);

  const unknown = await req("GET", GW + "/api/does-not-exist", { token: gwToken });
  check("gateway unknown route not 500", unknown.status === 401 || unknown.status === 404);

  const forgot = await req("POST", AUTH + "/api/auth/forgot-password", {
    body: { email: "user@skillsync.dev" },
  });
  check("forgot password 200", forgot.status === 200 || forgot.status === 204);

  const logout = await req("POST", AUTH + "/api/auth/logout", { token: userToken });
  check("logout 200", logout.status === 200 || logout.status === 204);

  const failed = results.filter((r) => !r.ok);
  console.log("\n---");
  console.log(`Passed ${results.filter((r) => r.ok).length}/${results.length}`);
  if (failed.length) {
    console.log("Failures:");
    for (const f of failed) console.log(" - " + f.name + (f.detail ? ": " + f.detail : ""));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
