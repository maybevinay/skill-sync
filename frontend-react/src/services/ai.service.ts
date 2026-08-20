import api, { serviceBase } from "@/lib/api";
import { authStore } from "@/lib/auth";

export const aiApi = {
  sessions: () => api.get("/api/chat/sessions").then((r) => r.data),
  session: (id: number) => api.get(`/api/chat/sessions/${id}`).then((r) => r.data),
  chat: (body: { sessionId?: number; message: string; regenerate?: boolean }) =>
    api.post("/api/chat", body).then((r) => r.data),
  documents: () => api.get("/api/rag/documents").then((r) => r.data),
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/api/rag/documents", form);
  },
  ragAsk: (question: string, sessionId?: number) => api.post("/api/rag/chat", { question, sessionId }).then((r) => r.data),
  async streamChat(body: { sessionId?: number; message: string; regenerate?: boolean }, onToken: (acc: string) => void) {
    const res = await fetch(`${serviceBase("/api/chat/stream")}/api/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authStore.token()}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      onToken("The assistant is unavailable right now. Please try again.");
      return "";
    }
    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let acc = "";
    if (!reader) return acc;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const line of decoder.decode(value).split("\n")) {
        if (line.startsWith("data:")) {
          acc += line.slice(5).trimStart();
          onToken(acc);
        }
      }
    }
    return acc;
  },
};
