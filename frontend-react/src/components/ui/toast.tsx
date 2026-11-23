import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";

type Tone = "success" | "danger" | "info";
type ToastItem = { id: number; title: string; tone: Tone };

const ToastContext = createContext<{ push: (title: string, tone?: Tone) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((title: string, tone: Tone = "info") => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, title, tone }]);
    window.setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4200);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[70] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 rounded-ss border border-line bg-surface p-3 shadow-card"
            role="status"
          >
            {t.tone === "success" && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />}
            {t.tone === "danger" && <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-danger" />}
            {t.tone === "info" && <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />}
            <p className="min-w-0 flex-1 text-sm text-foreground">{t.title}</p>
            <button
              type="button"
              className="rounded-md p-0.5 text-muted-2 hover:text-foreground"
              aria-label="Dismiss notification"
              onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
