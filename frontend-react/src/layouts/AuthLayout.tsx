import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function AuthLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-mesh grid min-h-screen place-items-center overflow-x-hidden px-4 py-10">
      <div className="glass w-full max-w-md rounded-ss p-7 shadow-card sm:p-8">
        <Link to="/" className="text-sm font-medium text-muted hover:text-foreground">
          ← SkillSync
        </Link>
        <h1 className="mb-6 mt-5 text-2xl font-semibold tracking-tight">{title}</h1>
        {children}
      </div>
    </div>
  );
}
