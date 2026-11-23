import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";

export function Logo({
  to = "/",
  inverse,
  className,
}: {
  to?: string;
  inverse?: boolean;
  className?: string;
}) {
  return (
    <Link to={to} className={cn("inline-flex items-center gap-2.5", className)} aria-label="SkillSync home">
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-xl text-[11px] font-bold tracking-tight",
          inverse ? "bg-white/12 text-white" : "bg-lavender text-primary",
        )}
      >
        SS
      </span>
      <span className={cn("text-[17px] font-semibold tracking-tight", inverse ? "text-white" : "text-foreground")}>
        Skill<span className={inverse ? "text-white/70" : "text-primary"}>Sync</span>
      </span>
    </Link>
  );
}
