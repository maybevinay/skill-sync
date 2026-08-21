import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Bot, GitCompare, Shield, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

const features = [
  {
    icon: GitCompare,
    title: "Explainable matching",
    body: "Scores blend skills, goals, experience, availability, and ratings — then show why a mentor ranked the way they did.",
  },
  {
    icon: Users,
    title: "Mentor marketplace",
    body: "Browse professionals, filter by skill, and send a request when the fit is right.",
  },
  {
    icon: Bot,
    title: "AI learning assistant",
    body: "Ask for roadmaps, interview prep, and skill strategy with conversation history that stays with you.",
  },
  {
    icon: Shield,
    title: "Grounded RAG answers",
    body: "Upload notes or handbooks. Answers cite the chunks they came from — not unverifiable guesses.",
  },
];

const mentors = [
  { name: "Maya Mentor", skill: "Spring Boot", match: 94, title: "Backend engineering" },
  { name: "Leo Backend", skill: "System Design", match: 91, title: "Distributed systems" },
  { name: "Priya Cloud", skill: "Kubernetes", match: 88, title: "Cloud platforms" },
];

const faqs = [
  ["How does matching work?", "SkillSync scores skill overlap (50%), learning goals (20%), experience (15%), availability (10%), and rating (5%), then returns human-readable reasons."],
  ["Is my data isolated?", "Auth, matching, and AI live in separate PostgreSQL databases behind a JWT gateway with rate limiting."],
  ["Do I need OpenAI?", "Any OpenAI-compatible endpoint works. Keys stay in environment variables on the server."],
  ["Can mentors be learners too?", "Yes. Roles are USER, MENTOR, and ADMIN. Mentors keep a learner profile."],
];

export function LandingPage() {
  return (
    <div className="relative overflow-x-hidden bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(ellipse_at_top,rgb(var(--ss-soft-lavender)/0.9),transparent_60%)]" />

      <header className="sticky top-0 z-30 border-b border-line/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-medium text-muted md:flex">
            <a className="hover:text-foreground" href="#features">
              Product
            </a>
            <a className="hover:text-foreground" href="#mentors">
              Mentors
            </a>
            <a className="hover:text-foreground" href="#pricing">
              Pricing
            </a>
            <a className="hover:text-foreground" href="#faq">
              FAQ
            </a>
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-16 md:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:pt-24">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI-powered peer learning
          </p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 text-balance text-4xl font-semibold leading-[1.12] tracking-tight md:text-5xl lg:text-[3.4rem]"
          >
            Learn smarter.
            <br />
            Connect better.
            <br />
            Grow together.
          </motion.h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            SkillSync connects learners with the right mentors to accelerate meaningful skill development — with explainable match scores and grounded AI.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" className="ss-cta border-0" asChild>
              <Link to="/register">
                Start matching <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="relative min-w-0">
          <div className="rounded-[1.25rem] border border-line bg-surface p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-2">Today</p>
                <p className="mt-1 text-lg font-semibold">Recommended mentors</p>
              </div>
              <span className="rounded-md bg-lavender px-2 py-1 text-xs font-medium text-primary">Live matching</span>
            </div>
            <div className="mt-5 space-y-3">
              {mentors.map((m) => (
                <div key={m.name} className="flex items-center gap-3 rounded-xl border border-line px-3 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lavender text-sm font-semibold text-primary">
                    {m.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{m.name}</div>
                    <div className="truncate text-xs text-muted">
                      {m.title} · {m.skill}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{m.match}%</div>
                    <div className="text-[11px] text-muted">Match</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-center sm:grid-cols-4 md:px-6">
          {[
            ["12k+", "Learners"],
            ["1.8k", "Mentors"],
            ["92%", "Avg match quality"],
            ["4.8", "Session rating"],
          ].map(([n, l]) => (
            <div key={l}>
              <div className="text-3xl font-semibold tracking-tight">{n}</div>
              <div className="mt-1 text-sm text-muted">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <p className="text-sm font-medium text-primary">Product</p>
        <h2 className="mt-2 max-w-xl text-3xl font-semibold tracking-tight">Everything you need to learn with the right people</h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
          Matching, requests, reviews, and AI sit in one workspace — without looking like a student CRUD demo.
        </p>
        <div className="mt-10 grid gap-x-10 gap-y-12 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lavender text-primary">
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-[17px] font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="mentors" className="bg-surface-2 py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-3xl font-semibold tracking-tight">Mentors ranked for your goals</h2>
          <p className="mt-3 max-w-xl text-[15px] text-muted">Match scores and skill chips so you can see fit before you send a request.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {mentors.map((m) => (
              <div key={m.name} className="rounded-ss border border-line bg-surface p-5">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lavender text-sm font-semibold text-primary">
                    {m.name[0]}
                  </div>
                  <span className="text-sm font-semibold text-primary">{m.match}% match</span>
                </div>
                <div className="mt-4 font-semibold">{m.name}</div>
                <div className="text-sm text-muted">{m.title}</div>
                <div className="mt-3">
                  <span className="ss-chip">{m.skill}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="ai" className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-primary">AI</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">An assistant that stays grounded</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              Chat for career strategy. RAG over your own documents when the answer needs a source. Keys never leave the server.
            </p>
          </div>
          <div className="rounded-ss border border-line bg-surface p-5">
            <div className="text-sm font-medium">How can I help you learn today?</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Find a Java mentor", "Create a learning roadmap", "Explain Spring Boot"].map((p) => (
                <span key={p} className="rounded-xl border border-line px-3 py-1.5 text-sm text-muted">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <h2 className="text-3xl font-semibold tracking-tight">What learners say</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {[
            ["Amit G.", "Learner", "I found a Spring mentor in a day. The reasons made the match feel fair."],
            ["Priya S.", "Mentor", "Requests and reviews stay structured — I always know what a learner needs."],
            ["Maya K.", "Admin", "Growth charts and audit logs are ready to show in a placement demo."],
          ].map(([name, role, quote]) => (
            <blockquote key={name}>
              <p className="text-[15px] leading-relaxed text-foreground">“{quote}”</p>
              <footer className="mt-4 text-sm text-muted">
                {name} · {role}
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section id="pricing" className="bg-surface-2 py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-3xl font-semibold tracking-tight">Simple plans</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ["Starter", "Free", ["3 mentor requests", "AI chat 20 msgs/day"], false],
              ["Pro", "$19/mo", ["Unlimited matching", "RAG documents", "Priority mentors"], true],
              ["Team", "$49/mo", ["Admin analytics", "SSO-ready JWT", "Audit logs"], false],
            ].map(([name, price, items, featured]) => (
              <div
                key={String(name)}
                className={
                  featured
                    ? "rounded-ss border border-primary/25 bg-surface p-6 shadow-card"
                    : "rounded-ss border border-line bg-surface p-6"
                }
              >
                <div className="text-sm font-medium text-muted">{name}</div>
                <div className="mt-2 text-3xl font-semibold tracking-tight">{price}</div>
                <ul className="mt-5 space-y-2 text-sm text-muted">
                  {(items as string[]).map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
                <Button className="mt-6 w-full" variant={featured ? "default" : "outline"} asChild>
                  <Link to="/register">Get started</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl px-4 py-20 md:px-6">
        <h2 className="text-3xl font-semibold tracking-tight">FAQ</h2>
        <div className="mt-8 divide-y divide-line border-y border-line">
          {faqs.map(([q, a]) => (
            <details key={q} className="group py-4">
              <summary className="cursor-pointer list-none font-medium marker:content-none">
                <span className="flex items-center justify-between gap-4">
                  {q}
                  <span className="text-muted-2 group-open:hidden">+</span>
                  <span className="hidden text-muted-2 group-open:inline">−</span>
                </span>
              </summary>
              <p className="mt-2 pr-8 text-sm leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="px-4 pb-20 md:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-ss bg-foreground px-8 py-12 text-white md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Ready to find your next mentor?</h2>
            <p className="mt-2 text-white/70">Create an account and complete your profile to start matching.</p>
          </div>
          <Button size="lg" className="bg-white text-foreground hover:bg-white/90" asChild>
            <Link to="/register">Create account</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-line px-4 py-10 text-sm text-muted md:px-6">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 md:flex-row md:items-center">
          <Logo />
          <div className="flex gap-5">
            <Link className="hover:text-foreground" to="/login">
              Sign in
            </Link>
            <Link className="hover:text-foreground" to="/register">
              Register
            </Link>
          </div>
          <div>© {new Date().getFullYear()} SkillSync</div>
        </div>
      </footer>
    </div>
  );
}
