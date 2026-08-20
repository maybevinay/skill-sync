import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { useQuery } from "@tanstack/react-query";
import { aiApi } from "@/services/ai.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/shared/EmptyState";
import { cn } from "@/lib/cn";

type Msg = { role: string; content: string };

export function AiAssistantPage() {
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

  async function send() {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setTyping(true);
    setMessages((m) => [...m, { role: "assistant", content: "" }]);
    await aiApi.streamChat({ sessionId, message: text }, (acc) => {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: acc };
        return copy;
      });
    });
    setTyping(false);
    const list = await aiApi.sessions();
    if (!sessionId && list?.[0]?.id) setSessionId(list[0].id);
  }

  async function regenerate() {
    setTyping(true);
    const data = await aiApi.chat({ sessionId, message: "", regenerate: true });
    setMessages((m) => [...m.slice(0, -1), { role: "assistant", content: String(data.content) }]);
    setTyping(false);
  }

  return (
    <div className="grid h-[min(75vh,40rem)] min-h-[28rem] gap-4 md:grid-cols-[13.5rem_minmax(0,1fr)]">
      <aside className="glass min-h-0 overflow-auto rounded-ss p-3">
        <button
          className="mb-3 w-full rounded-ss px-2 py-2 text-left text-sm font-medium text-accent hover:bg-foreground/5"
          onClick={() => {
            setSessionId(undefined);
            setMessages([]);
          }}
        >
          New chat
        </button>
        {sessions.data?.map((s: { id: number; title: string }) => (
          <button
            key={s.id}
            onClick={() => void loadSession(s.id)}
            className={cn(
              "block w-full truncate rounded-ss px-2 py-2 text-left text-sm text-muted hover:bg-foreground/5 hover:text-foreground",
              sessionId === s.id && "bg-primary/15 text-foreground",
            )}
          >
            {s.title}
          </button>
        ))}
      </aside>
      <section className="glass flex min-h-0 min-w-0 flex-col rounded-ss">
        <div className="min-h-0 flex-1 space-y-3 overflow-auto p-4">
          {!messages.length && <EmptyState title="Ask SkillSync" hint="Career, skills, matching strategy, or interview prep." />}
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "user"
                  ? "ml-4 rounded-ss bg-primary/15 p-3 sm:ml-12"
                  : "mr-4 rounded-ss bg-foreground/5 p-3 sm:mr-12"
              }
            >
              <div className="prose-sm max-w-none overflow-x-auto text-sm [&_pre]:overflow-x-auto">
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{m.content}</ReactMarkdown>
              </div>
              {m.role === "assistant" && (
                <div className="mt-2 flex gap-3 text-xs text-muted">
                  <button className="hover:text-foreground" onClick={() => void navigator.clipboard.writeText(m.content)}>
                    Copy
                  </button>
                  {i === messages.length - 1 && (
                    <button className="hover:text-foreground" onClick={() => void regenerate()}>
                      Regenerate
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          {typing && (
            <div className="animate-pulse text-sm text-accent" role="status">
              SkillSync is typing…
            </div>
          )}
          <div ref={bottom} />
        </div>
        <form
          className="flex gap-2 border-t border-line p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask SkillSync…" />
          <Button>Send</Button>
        </form>
      </section>
    </div>
  );
}
