import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { useQuery } from "@tanstack/react-query";
import { Copy, Loader2, Plus, Send, Sparkles } from "lucide-react";
import { aiApi } from "@/services/ai.service";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useAuth } from "@/hooks/useAuth";
import { firstName } from "@/lib/ui";

type Msg = { role: string; content: string };

const prompts = ["Find a Java mentor", "Create a learning roadmap", "Explain Spring Boot", "Improve my skills"];

export function AiAssistantPage() {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<number | undefined>();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const sessions = useQuery({ queryKey: ["chat-sessions"], queryFn: aiApi.sessions });

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  async function loadSession(id: number) {
    const data = await aiApi.session(id);
    setSessionId(id);
    setMessages(data.messages);
  }

  async function send(text = input.trim()) {
    if (!text || typing) return;
    setMessages((m) => [...m, { role: "user", content: text }, { role: "assistant", content: "" }]);
    setInput("");
    setTyping(true);
    try {
      await aiApi.streamChat({ sessionId, message: text }, (acc) => {
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      });
      const list = await aiApi.sessions();
      if (!sessionId && list?.[0]?.id) setSessionId(list[0].id);
    } catch {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          role: "assistant",
          content: "The assistant is unavailable right now. Please try again.",
        };
        return copy;
      });
    } finally {
      setTyping(false);
    }
  }

  async function regenerate() {
    if (typing) return;
    setTyping(true);
    try {
      const data = await aiApi.chat({ sessionId, message: "", regenerate: true });
      setMessages((m) => [...m.slice(0, -1), { role: "assistant", content: String(data.content) }]);
    } catch {
      setMessages((m) => [
        ...m.slice(0, -1),
        { role: "assistant", content: "The assistant is unavailable right now. Please try again." },
      ]);
    } finally {
      setTyping(false);
    }
  }

  return (
    <div className="grid h-[min(78vh,46rem)] min-h-[32rem] gap-4 md:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="min-h-0 overflow-auto rounded-ss border border-line bg-surface p-3">
        <button
          type="button"
          className="mb-3 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium hover:bg-lavender"
          onClick={() => {
            setSessionId(undefined);
            setMessages([]);
          }}
        >
          <Plus className="h-4 w-4" /> New chat
        </button>
        {sessions.data?.map((s: { id: number; title: string }) => (
          <button
            key={s.id}
            type="button"
            onClick={() => void loadSession(s.id)}
            className={cn(
              "block w-full truncate rounded-xl px-3 py-2 text-left text-sm text-muted hover:bg-lavender hover:text-foreground",
              sessionId === s.id && "bg-lavender text-foreground",
            )}
          >
            {s.title}
          </button>
        ))}
      </aside>
      <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-ss border border-line bg-surface">
        <div className="flex items-center gap-3 border-b border-line px-5 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lavender text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">SkillSync AI</p>
            <p className="text-xs text-muted">Career, skills, and mentor strategy</p>
          </div>
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-auto px-5 py-5">
          {!messages.length && (
            <div className="flex h-full min-h-[16rem] flex-col items-center justify-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-lavender text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="text-[17px] font-semibold">How can I help you learn today, {firstName(user?.fullName)}?</p>
              <p className="mt-1 text-sm text-muted">Ask about matching, roadmaps, or interview prep.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {prompts.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className="rounded-xl border border-line px-3 py-1.5 text-sm hover:bg-lavender"
                    onClick={() => void send(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  m.role === "user" ? "bg-lavender" : "bg-soft-blue",
                )}
              >
                <div className="prose-sm max-w-none overflow-x-auto [&_pre]:overflow-x-auto">
                  {m.role === "assistant" && !m.content ? (
                    <div className="ss-dots flex items-center gap-1 py-1" role="status" aria-label="SkillSync is typing">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    </div>
                  ) : (
                    <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{m.content}</ReactMarkdown>
                  )}
                </div>
                {m.role === "assistant" && m.content && (
                  <div className="mt-2 flex gap-3 text-xs text-muted">
                    <button type="button" className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => void navigator.clipboard.writeText(m.content)}>
                      <Copy className="h-3 w-3" /> Copy
                    </button>
                    {i === messages.length - 1 && (
                      <button type="button" className="hover:text-foreground" onClick={() => void regenerate()}>
                        Regenerate
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={bottom} />
        </div>
        <form
          className="border-t border-line p-4"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <div className="flex items-end gap-2 rounded-xl border border-line px-2 py-2 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15">
            <textarea
              className="max-h-32 min-h-[2.5rem] flex-1 resize-none bg-transparent py-2 text-sm outline-none placeholder:text-muted-2"
              rows={1}
              value={input}
              placeholder="Ask SkillSync…"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
            />
            <Button type="submit" className="h-10 rounded-[10px]" disabled={typing || !input.trim()}>
              {typing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
