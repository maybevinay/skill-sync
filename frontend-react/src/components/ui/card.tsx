import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({
  className,
  children,
  hover,
}: {
  className?: string;
  children: ReactNode;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-ss border border-line bg-surface p-5",
        hover && "transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-card",
        className,
      )}
    >
      {children}
    </div>
  );
}
