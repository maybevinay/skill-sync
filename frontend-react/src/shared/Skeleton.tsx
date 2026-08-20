import { cn } from "@/lib/cn";

export function Skeleton({ className = "h-24" }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-ss bg-foreground/10", className)} />;
}
