import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export function initials(name?: string) {
  if (!name?.trim()) return "SS";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function firstName(name?: string) {
  return name?.trim().split(" ")[0] || "there";
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function availabilityLabel(value?: string) {
  if (value === "WEEKDAYS") return "Available weekdays";
  if (value === "WEEKNIGHTS") return "Available weeknights";
  if (value === "WEEKENDS") return "Available weekends";
  if (value === "FLEXIBLE") return "Flexible availability";
  return value || "Availability not set";
}

export function formatDate(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function Avatar({ name, src, className }: { name?: string; src?: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [src]);
  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={cn("h-10 w-10 shrink-0 rounded-full object-cover", className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lavender text-xs font-semibold text-primary",
        className,
      )}
      aria-hidden={name ? undefined : true}
      aria-label={name ? `${name} avatar` : undefined}
    >
      {initials(name)}
    </div>
  );
}
