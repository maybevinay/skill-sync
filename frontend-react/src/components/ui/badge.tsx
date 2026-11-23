import { cn } from "@/lib/cn";

const tones: Record<string, string> = {
  neutral: "bg-surface-2 text-muted",
  primary: "bg-lavender text-primary",
  success: "bg-mint text-success",
  warning: "bg-soft-yellow text-warning",
  danger: "bg-rose text-danger",
  accent: "bg-soft-blue text-primary",
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
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
