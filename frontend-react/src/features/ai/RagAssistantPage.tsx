import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Copy,
  FileText,
  Loader2,
  MoreHorizontal,
  Paperclip,
  Play,
  RefreshCw,
  Send,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { aiApi, type RagDocument, type RagProcessResult } from "@/services/ai.service";
import { apiErrorMessage } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type Source = { filename: string; chunkIndex: number; score: number };
type ChatMsg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  grounded?: boolean;
  reason?: string | null;
};

function statusLabel(status: string) {
  if (status === "PROCESSED") return "Processed";
  if (status === "PROCESSING") return "Processing";
  if (status === "FAILED") return "Failed";
  if (status === "UPLOADED") return "Uploaded";
  return status;
}

function statusClass(status: string) {
  if (status === "PROCESSED") return "bg-mint text-success";
  if (status === "PROCESSING") return "bg-lavender text-primary";
  if (status === "FAILED") return "bg-rose text-danger";
  return "bg-soft-blue text-primary";
}

function formatBytes(bytes?: number) {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function firstName(name?: string) {
  return name?.trim().split(" ")[0] || "there";
}

export function RagAssistantPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { push } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const chatInput = useRef<HTMLTextAreaElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [processError, setProcessError] = useState("");
  const [success, setSuccess] = useState<RagProcessResult | null>(null);
  const [ctaDone, setCtaDone] = useState(false);
  const [question, setQuestion] = useState("");
  const [sessionId, setSessionId] = useState<number | undefined>();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [menuFor, setMenuFor] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Record<string, "up" | "down">>({});

  const docs = useQuery({ queryKey: ["rag-docs"], queryFn: aiApi.documents });
  const processedDocs = (docs.data ?? []).filter((d) => d.status === "PROCESSED");

  const processDoc = useMutation({
    mutationFn: (selected: File) => aiApi.upload(selected),
    onMutate: () => {
      setProcessError("");
      setCtaDone(false);
      push("Processing started", "info");
    },
    onSuccess: async (result) => {
      setSuccess(result);
      setCtaDone(true);
      setFile(null);
      if (fileInput.current) fileInput.current.value = "";
      await qc.invalidateQueries({ queryKey: ["rag-docs"] });
      push("Document processed successfully", "success");
    },
    onError: (err) => {
      setCtaDone(false);
      setProcessError(apiErrorMessage(err, "Document processing failed."));
      push("Document processing failed", "danger");
    },
  });

  const removeDoc = useMutation({
    mutationFn: (id: number) => aiApi.deleteDocument(id),
    onSuccess: async () => {
      setMenuFor(null);
      await qc.invalidateQueries({ queryKey: ["rag-docs"] });
      push("Document deleted", "success");
    },
    onError: (err) => push(apiErrorMessage(err, "Could not delete the document."), "danger"),
  });

  const ask = useMutation({
    mutationFn: ({ text, sid }: { text: string; sid?: number }) => aiApi.ragAsk(text, sid),
    onSuccess: (data) => {
      if (typeof data.sessionId === "number") setSessionId(data.sessionId);
      const sources = Array.isArray(data.sources) ? data.sources : [];
      setMessages((m) => [
        ...m.filter((x) => x.id !== "pending"),
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: String(data.content ?? ""),
          sources,
          grounded: Boolean(data.grounded),
          reason: typeof data.retrievalReason === "string" ? data.retrievalReason : null,
        },
      ]);
    },
    onError: (err) => {
      setMessages((m) => [
        ...m.filter((x) => x.id !== "pending"),
        {
          id: `e-${Date.now()}`,
          role: "assistant",
          content: apiErrorMessage(err, "Could not ask the assistant."),
        },
      ]);
    },
  });

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, ask.isPending]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSuccess(null);
        setMenuFor(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function chooseFile(next: File | undefined | null) {
    if (!next) return;
    setFile(next);
    setCtaDone(false);
    setProcessError("");
    push("Document selected", "info");
  }

  function submitQuestion() {
    const text = question.trim();
    if (!text || ask.isPending) return;
    if (!processedDocs.length) {
      setMessages((m) => [
        ...m,
        { id: `u-${Date.now()}`, role: "user", content: text },
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: "Please process a document before asking document-based questions.",
          grounded: false,
          reason: "NO_DOCUMENTS",
        },
      ]);
      setQuestion("");
      return;
    }
    setMessages((m) => [
      ...m,
      { id: `u-${Date.now()}`, role: "user", content: text },
      { id: "pending", role: "assistant", content: "Searching your documents…" },
    ]);
    setQuestion("");
    ask.mutate({ text, sid: sessionId });
  }

  function clearChat() {
    setMessages([]);
    setSessionId(undefined);
    setFeedback({});
    push("Chat cleared", "info");
  }

  function retryFailed(doc: RagDocument) {
    setMenuFor(null);
    if (file && file.name === doc.filename) {
      processDoc.mutate(file);
      return;
    }
    push("Choose the original file again, then click Process Document.", "info");
    fileInput.current?.click();
  }

  const processLabel = processDoc.isPending
    ? "Processing..."
    : processError
      ? "Try Again"
      : ctaDone
        ? "Processed ✓"
        : "Process Document";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,38%)_minmax(0,62%)] lg:items-start">
      <div className="space-y-6">
        <section className="rounded-ss border border-line bg-surface p-5 shadow-card">
          <h2 className="text-[17px] font-semibold text-foreground">Upload & Process Document</h2>
          <p className="mt-1 text-sm text-muted">Upload a PDF, TXT or MD file to get started.</p>

          <input
            id="rag-file"
            ref={fileInput}
            className="sr-only"
            type="file"
            accept=".pdf,.txt,.md,.html,.htm,.markdown"
            onChange={(e) => chooseFile(e.target.files?.[0])}
          />

          <button
            type="button"
            className={cn("ss-dropzone mt-4 w-full", dragOver && "ss-dropzone-active")}
            onClick={() => fileInput.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              chooseFile(e.dataTransfer.files?.[0]);
            }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-primary shadow-card">
              <Upload className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Drag & drop your file here</p>
              <p className="mt-1 text-xs text-muted">or</p>
            </div>
            <span className="inline-flex h-11 items-center rounded-[10px] bg-primary px-5 text-sm font-medium text-white shadow-sm">
              Choose File
            </span>
          </button>

          {file && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-line bg-surface-2 px-3 py-2.5">
              <FileText className="h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted">{formatBytes(file.size)}</p>
              </div>
              <Check className="h-4 w-4 shrink-0 text-success" />
              <button
                type="button"
                className="rounded-md p-1 text-muted hover:text-danger"
                aria-label="Remove selected file"
                onClick={() => {
                  setFile(null);
                  setCtaDone(false);
                  if (fileInput.current) fileInput.current.value = "";
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <Button
            type="button"
            size="lg"
            className="ss-cta mt-4 w-full rounded-[10px]"
            disabled={!file || processDoc.isPending}
            onClick={() => file && processDoc.mutate(file)}
          >
            {processDoc.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {processLabel}
          </Button>

          {processDoc.isPending && (
            <div className="mt-4 rounded-xl bg-lavender/70 px-4 py-3 text-sm text-muted">
              <p className="font-medium text-foreground">Processing document…</p>
              <ul className="mt-2 space-y-1 text-xs">
                <li>Extracting text</li>
                <li>Creating chunks</li>
                <li>Generating embeddings</li>
                <li>Storing vectors</li>
              </ul>
            </div>
          )}

          {processError && (
            <p className="mt-3 text-sm text-danger" role="alert">
              Document processing failed. {processError}
            </p>
          )}
        </section>

        <section className="rounded-ss border border-line bg-surface p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-[17px] font-semibold">Your Documents</h2>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 px-0"
              aria-label="Refresh documents"
              onClick={() => void docs.refetch()}
            >
              <RefreshCw className={cn("h-4 w-4", docs.isFetching && "animate-spin")} />
            </Button>
          </div>

          {docs.isError && (
            <p className="text-sm text-danger" role="alert">
              {apiErrorMessage(docs.error, "Could not load documents.")}
            </p>
          )}

          {!docs.data?.length && !docs.isError ? (
            <div className="flex flex-col items-center px-4 py-10 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-lavender text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">No documents yet</p>
              <p className="mt-1 max-w-xs text-sm text-muted">
                Upload a PDF, TXT or MD file to ground your answers.
              </p>
              <Button className="mt-4" type="button" onClick={() => fileInput.current?.click()}>
                Choose File
              </Button>
            </div>
          ) : (
            <ul className="space-y-3">
              {(docs.data ?? []).map((d: RagDocument) => (
                <li key={d.id} className="rounded-xl border border-line p-3 transition hover:border-primary/20">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-lavender text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <p className="min-w-0 flex-1 truncate text-sm font-medium">{d.filename}</p>
                        <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-medium", statusClass(d.status))}>
                          {statusLabel(d.status)}
                        </span>
                        <div className="relative">
                          <button
                            type="button"
                            className="rounded-md p-1 text-muted hover:bg-lavender hover:text-foreground"
                            aria-label="Document actions"
                            onClick={() => setMenuFor(menuFor === d.id ? null : d.id)}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                          {menuFor === d.id && (
                            <div className="absolute right-0 z-10 mt-1 w-40 rounded-xl border border-line bg-surface p-1 shadow-card">
                              {d.status === "FAILED" && (
                                <button
                                  type="button"
                                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-lavender"
                                  onClick={() => retryFailed(d)}
                                >
                                  Retry processing
                                </button>
                              )}
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-danger hover:bg-rose"
                                onClick={() => removeDoc.mutate(d.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        {[formatDate(d.createdAt), d.chunks ? `${d.chunks} chunks` : null, formatBytes(d.fileSizeBytes)]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      {d.status === "FAILED" && d.errorMessage && (
                        <p className="mt-2 text-xs text-danger">{d.errorMessage}</p>
                      )}
                      {d.status === "PROCESSED" && (
                        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                          <Metric label="Chunks" value={String(d.chunks ?? 0)} tone="lavender" />
                          <Metric label="Embeddings" value={String(d.embeddings ?? d.chunks ?? 0)} tone="blue" />
                          <Metric label="Storage" value={formatBytes(d.fileSizeBytes) ?? "—"} tone="mint" />
                          <Metric label="Processed" value="100%" tone="yellow" />
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="flex min-h-[36rem] flex-col overflow-hidden rounded-ss border border-line bg-surface shadow-card lg:min-h-[44rem]">
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lavender text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-[17px] font-semibold">Ask anything from your documents</h2>
              <p className="mt-0.5 text-sm text-muted">
                I'll search your documents and provide accurate answers with sources.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={clearChat}>
            Clear Chat
          </Button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {!messages.length ? (
            <div className="flex h-full min-h-[16rem] flex-col items-center justify-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-lavender text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">Ask anything about your documents</p>
              <p className="mt-1 max-w-sm text-sm text-muted">
                Hi {firstName(user?.fullName)} — upload a document and start asking questions.
              </p>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={cn("flex gap-3", m.role === "user" && "justify-end")}>
                {m.role === "assistant" && (
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lavender text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-lavender text-foreground"
                      : "bg-soft-blue text-foreground",
                  )}
                >
                  {m.role === "assistant" && m.reason === "NO_MATCH" && (
                    <p className="mb-2 text-xs text-muted">No sufficiently similar passages were retrieved.</p>
                  )}
                  <div className="prose-sm max-w-none overflow-x-auto [&_pre]:overflow-x-auto">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-3">
                      <p className="mb-1.5 text-xs font-medium text-muted">Sources</p>
                      <div className="flex flex-wrap gap-1.5">
                        {m.sources.map((s, i) => (
                          <span
                            key={`${s.filename}-${s.chunkIndex}-${i}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2 py-1 text-[11px] text-muted hover:border-primary/30 hover:text-foreground"
                          >
                            <FileText className="h-3 w-3" />
                            <span className="max-w-[10rem] truncate">{s.filename}</span>
                            <span>Chunk {s.chunkIndex}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {m.role === "assistant" && m.id !== "pending" && (
                    <div className="mt-2 flex gap-1">
                      <IconAction
                        label="Like"
                        active={feedback[m.id] === "up"}
                        onClick={() => setFeedback((f) => ({ ...f, [m.id]: "up" }))}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </IconAction>
                      <IconAction
                        label="Dislike"
                        active={feedback[m.id] === "down"}
                        onClick={() => setFeedback((f) => ({ ...f, [m.id]: "down" }))}
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </IconAction>
                      <IconAction
                        label="Copy"
                        onClick={() => void navigator.clipboard.writeText(m.content)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </IconAction>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={bottom} />
        </div>

        <form
          className="border-t border-line p-4"
          onSubmit={(e) => {
            e.preventDefault();
            submitQuestion();
          }}
        >
          <div className="flex items-end gap-2 rounded-xl border border-line bg-surface px-2 py-2 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15">
            <button
              type="button"
              className="mb-1 rounded-lg p-2 text-muted hover:bg-lavender hover:text-primary"
              aria-label="Attach a document"
              onClick={() => fileInput.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <textarea
              ref={chatInput}
              className="max-h-32 min-h-[2.5rem] flex-1 resize-none bg-transparent py-2 text-sm outline-none placeholder:text-muted-2"
              rows={1}
              value={question}
              placeholder="Type your question here..."
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitQuestion();
                }
              }}
            />
            <Button type="submit" className="ss-cta h-10 rounded-[10px] px-4" disabled={ask.isPending || !question.trim()}>
              {ask.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </form>
      </section>

      <AnimatePresence>
        {success && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
              type="button"
              className="absolute inset-0 bg-foreground/35 backdrop-blur-sm"
              aria-label="Close"
              onClick={() => setSuccess(null)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="rag-success-title"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-md rounded-ss border border-line bg-surface p-8 text-center shadow-card"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-mint text-success">
                <Check className="h-7 w-7" />
              </div>
              <h3 id="rag-success-title" className="text-lg font-semibold">
                Document processed successfully
              </h3>
              <p className="mt-2 truncate text-sm text-foreground">{success.filename}</p>
              <p className="mt-3 text-sm text-muted">
                {success.chunks} chunks · {success.embeddings} embeddings
              </p>
              <p className="mt-2 text-sm text-muted">Your document is now ready for RAG questions.</p>
              <Button className="ss-cta mt-6 w-full rounded-[10px]" onClick={() => setSuccess(null)}>
                Continue
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: "lavender" | "blue" | "mint" | "yellow" }) {
  const bg =
    tone === "lavender" ? "bg-lavender" : tone === "blue" ? "bg-soft-blue" : tone === "mint" ? "bg-mint" : "bg-soft-yellow";
  return (
    <div className={cn("rounded-xl px-2.5 py-2", bg)}>
      <p className="text-sm font-semibold text-foreground">{value}</p>
      <p className="text-[11px] text-muted">{label}</p>
    </div>
  );
}

function IconAction({
  children,
  label,
  onClick,
  active,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "rounded-md p-1 text-muted-2 hover:text-foreground",
        active && "text-primary",
      )}
    >
      {children}
    </button>
  );
}
