import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function StatCard({
  label,
  value,
  hint,
  icon,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-ss border border-line bg-surface p-5", className)}>
      <div className="flex items-center gap-2 text-sm text-muted">
        {icon}
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{value}</div>
      {hint && <p className="mt-2 text-sm text-muted">{hint}</p>}
    </div>
  );
}
