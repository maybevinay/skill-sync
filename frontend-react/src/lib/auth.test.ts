import { beforeEach, describe, expect, it } from "vitest";
import { authStore, type AuthUser } from "./auth";

const memory = new Map<string, string>();

beforeEach(() => {
  memory.clear();
  globalThis.localStorage = {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
    removeItem: (key: string) => {
      memory.delete(key);
    },
    clear: () => memory.clear(),
    key: (index: number) => [...memory.keys()][index] ?? null,
    get length() {
      return memory.size;
    },
  } as Storage;
});

describe("authStore", () => {
  const user: AuthUser = {
    id: 3,
    fullName: "Uma User",
    email: "user@skillsync.dev",
    role: "USER",
    enabled: true,
    emailVerified: true,
  };

  it("persists and restores the session user", () => {
    authStore.save("access", "refresh", user);
    expect(authStore.token()).toBe("access");
    expect(authStore.user()?.email).toBe("user@skillsync.dev");
  });

  it("clears tokens on logout", () => {
    authStore.save("access", "refresh", user);
    authStore.clear();
    expect(authStore.token()).toBeNull();
    expect(authStore.user()).toBeNull();
  });
});
