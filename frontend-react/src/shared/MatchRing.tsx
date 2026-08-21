import { cn } from "@/lib/cn";

export function MatchRing({ value, size = 72, className }: { value: number; size?: number; className?: string }) {
  const r = 16;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 40 40" className="-rotate-90" width={size} height={size} aria-hidden>
        <circle cx="20" cy="20" r={r} fill="none" stroke="currentColor" className="text-lavender" strokeWidth="3.5" />
        <circle
          cx="20"
          cy="20"
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-primary"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
        />
      </svg>
      <span className="absolute text-[13px] font-semibold tracking-tight">{pct}%</span>
      <span className="sr-only">{pct} percent match</span>
    </div>
  );
}
