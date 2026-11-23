export type Role = "USER" | "MENTOR" | "ADMIN";

export type AuthUser = {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  enabled: boolean;
  emailVerified: boolean;
};

const KEY_USER = "ss_user";

export const authStore = {
  save(access: string, refresh: string, user: AuthUser) {
    localStorage.setItem("ss_access", access);
    localStorage.setItem("ss_refresh", refresh);
    localStorage.setItem(KEY_USER, JSON.stringify(user));
  },
  user(): AuthUser | null {
    const raw = localStorage.getItem(KEY_USER);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  },
  token() {
    return localStorage.getItem("ss_access");
  },
  clear() {
    localStorage.removeItem("ss_access");
    localStorage.removeItem("ss_refresh");
    localStorage.removeItem(KEY_USER);
  },
};
