import { cn } from "@/lib/cn";

const tones: Record<string, string> = {
  neutral: "border-line bg-foreground/5 text-muted",
  primary: "border-primary/20 bg-primary/10 text-primary",
  success: "border-success/25 bg-success/10 text-success",
  warning: "border-warning/25 bg-warning/10 text-warning",
  danger: "border-danger/25 bg-danger/10 text-danger",
  accent: "border-accent/25 bg-accent/10 text-accent",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: string;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide", tones[tone], className)}>
      {children}
    </span>
  );
}
