import api from "@/lib/api";
import { authStore, type AuthUser, type Role } from "@/lib/auth";

type AuthPayload = { accessToken: string; refreshToken: string; user: AuthUser };

function persist(data: AuthPayload) {
  authStore.save(data.accessToken, data.refreshToken, data.user);
  return data.user;
}

export const authApi = {
  async login(email: string, password: string) {
    const { data } = await api.post<AuthPayload>("/api/auth/login", { email, password });
    return persist(data);
  },
  async register(fullName: string, email: string, password: string, role: Role) {
    const { data } = await api.post<AuthPayload>("/api/auth/register", { fullName, email, password, role });
    return persist(data);
  },
  async logout() {
    try {
      await api.post("/api/auth/logout");
    } finally {
      authStore.clear();
    }
  },
  async me() {
    const { data } = await api.get<AuthUser>("/api/auth/me");
    return data;
  },
};
