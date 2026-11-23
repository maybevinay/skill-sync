import api, { serviceBase } from "@/lib/api";
import { authStore } from "@/lib/auth";

export type RagDocument = {
  id: number;
  filename: string;
  status: string;
  chunks: number;
  embeddings?: number;
  fileSizeBytes?: number;
  createdAt?: string;
  processedAt?: string | null;
  errorMessage?: string;
};

export type RagProcessResult = {
  documentId: number;
  filename: string;
  chunks: number;
  embeddings: number;
  status: string;
};

export const aiApi = {
  sessions: () => api.get("/api/chat/sessions").then((r) => r.data),
  session: (id: number) => api.get(`/api/chat/sessions/${id}`).then((r) => r.data),
  chat: (body: { sessionId?: number; message: string; regenerate?: boolean }) =>
    api.post("/api/chat", body).then((r) => r.data),
  documents: () => api.get("/api/rag/documents").then((r) => r.data as RagDocument[]),
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/api/rag/documents", form).then((r) => r.data as RagProcessResult);
  },
  deleteDocument: (id: number) => api.delete(`/api/rag/documents/${id}`),
  ragAsk: (question: string, sessionId?: number) => api.post("/api/rag/chat", { question, sessionId }).then((r) => r.data),
  async streamChat(body: { sessionId?: number; message: string; regenerate?: boolean }, onToken: (acc: string) => void) {
    const res = await fetch(`${serviceBase("/api/chat/stream")}/api/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authStore.token()}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      let detail = "The assistant is unavailable right now. Please try again.";
      try {
        const body = await res.json();
        if (body?.message) detail = String(body.message);
      } catch {
        /* keep fallback */
      }
      onToken(detail);
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
