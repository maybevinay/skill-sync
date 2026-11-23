import type { ReactNode } from "react";
import { Logo } from "@/components/ui/logo";

export function AuthLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen overflow-x-hidden bg-background lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-foreground px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -left-16 top-24 h-80 w-80 rounded-full bg-primary/25 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.14]">
          <svg className="h-full w-full" viewBox="0 0 480 640" fill="none" aria-hidden>
            <circle cx="90" cy="180" r="6" fill="white" />
            <circle cx="210" cy="120" r="4" fill="white" />
            <circle cx="320" cy="210" r="7" fill="white" />
            <circle cx="140" cy="320" r="4" fill="white" />
            <circle cx="280" cy="380" r="5" fill="white" />
            <path d="M90 180 L210 120 L320 210 L280 380 L140 320 Z" stroke="white" strokeWidth="1" />
          </svg>
        </div>
        <Logo to="/" inverse className="relative z-10" />
        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight">
            Learn smarter.
            <br />
            Connect better.
            <br />
            Grow together.
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-white/70">
            SkillSync connects learners with the right mentors to accelerate meaningful skill development.
          </p>
        </div>
        <p className="relative z-10 text-sm text-white/50">Peer learning · Explainable matching · Grounded AI</p>
      </aside>
      <main className="ss-page flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-[26rem]">
          <div className="mb-10 lg:hidden">
            <Logo to="/" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          {children}
        </div>
      </main>
    </div>
  );
}
