import { describe, expect, it } from "vitest";
import { apiErrorMessage, serviceBase } from "./api";

describe("serviceBase", () => {
  it("routes auth users and admin-user APIs to auth-service", () => {
    expect(serviceBase("/api/auth/login")).toBe("http://localhost:8081");
    expect(serviceBase("/api/users/me")).toBe("http://localhost:8081");
    expect(serviceBase("/api/admin/users")).toBe("http://localhost:8081");
  });

  it("routes matching APIs to matching-service", () => {
    expect(serviceBase("/api/profile/me")).toBe("http://localhost:8082");
    expect(serviceBase("/api/skills")).toBe("http://localhost:8082");
    expect(serviceBase("/api/mentors")).toBe("http://localhost:8082");
    expect(serviceBase("/api/requests")).toBe("http://localhost:8082");
    expect(serviceBase("/api/reviews")).toBe("http://localhost:8082");
    expect(serviceBase("/api/admin/analytics")).toBe("http://localhost:8082");
  });

  it("routes AI APIs to ai-service", () => {
    expect(serviceBase("/api/chat")).toBe("http://localhost:8083");
    expect(serviceBase("/api/chat/stream")).toBe("http://localhost:8083");
    expect(serviceBase("/api/rag/documents")).toBe("http://localhost:8083");
    expect(serviceBase("/api/admin/ai-stats")).toBe("http://localhost:8083");
  });
});

describe("apiErrorMessage", () => {
  it("prefers the server message", () => {
    expect(
      apiErrorMessage(
        { response: { status: 409, data: { message: "Email already registered" } } },
        "fallback",
      ),
    ).toBe("Email already registered");
  });

  it("maps 401 without a body to invalid credentials", () => {
    expect(apiErrorMessage({ response: { status: 401, data: {} } }, "fallback")).toBe(
      "Invalid credentials",
    );
  });

  it("explains unreachable auth-service instead of false invalid credentials", () => {
    expect(apiErrorMessage({}, "fallback")).toContain("8081");
  });
});
