import api from "@/lib/api";

export const matchingApi = {
  profile: () => api.get("/api/profile/me").then((r) => r.data),
  saveProfile: (body: unknown) => api.put("/api/profile/me", body).then((r) => r.data),
  skills: (q?: string) => api.get("/api/skills", { params: { q } }).then((r) => r.data),
  addSkill: (skillId: number) => api.post("/api/profile/me/skills", { skillId, level: "INTERMEDIATE", progress: 40 }),
  removeSkill: (skillId: number) => api.delete(`/api/profile/me/skills/${skillId}`),
  mentors: (params: Record<string, string | undefined>) => api.get("/api/mentors", { params }).then((r) => r.data),
  recommendations: () => api.get("/api/mentors/recommendations").then((r) => r.data),
  requests: () => api.get("/api/requests").then((r) => r.data),
  createRequest: (mentorId: number, message: string) => api.post("/api/requests", { mentorId, message }),
  updateRequest: (id: number, status: string) => api.patch(`/api/requests/${id}`, null, { params: { status } }),
  reviews: () => api.get("/api/reviews").then((r) => r.data),
  addReview: (body: { requestId: number; rating: number; comment: string }) => api.post("/api/reviews", body),
};
