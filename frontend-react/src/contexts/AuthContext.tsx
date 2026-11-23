import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { authStore, type AuthUser, type Role } from "@/lib/auth";
import { authApi } from "@/services/auth.service";

type AuthContextValue = {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (fullName: string, email: string, password: string, role: Role) => Promise<AuthUser>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => authStore.user());

  const login = useCallback(async (email: string, password: string) => {
    const next = await authApi.login(email, password);
    setUser(next);
    return next;
  }, []);

  const register = useCallback(async (fullName: string, email: string, password: string, role: Role) => {
    const next = await authApi.register(fullName, email, password, role);
    setUser(next);
    return next;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, register, logout }), [user, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
