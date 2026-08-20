import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const features = [
  ["Mentor matching", "Explainable scores across skills, goals, experience, availability, and ratings."],
  ["Skill graph", "Track levels, categories, and progress with chips and bars."],
  ["Requests & reviews", "Request a mentor, complete sessions, and leave structured reviews."],
  ["Admin analytics", "Growth, skill trends, and audit-ready operations."],
];

const aiFeatures = [
  ["GenAI assistant", "ChatGPT-style UI with history, regenerate, and markdown."],
  ["RAG over PostgreSQL", "PDF chunking, embeddings, and semantic search without a vector DB."],
  ["Chat memory", "Sessions and messages restore context automatically."],
];

const mentors = [
  { name: "Maya Mentor", skill: "Spring Boot", match: 94 },
  { name: "Leo Backend", skill: "System Design", match: 91 },
  { name: "Priya Cloud", skill: "Kubernetes", match: 88 },
];

const faqs = [
  ["How does matching work?", "SkillSync scores skill overlap (50%), learning goals (20%), experience (15%), availability (10%), and rating (5%), then returns human-readable reasons."],
  ["Is my data isolated?", "Auth, matching, and AI live in separate PostgreSQL databases behind a JWT gateway with rate limiting."],
  ["Do I need OpenAI?", "Any OpenAI-compatible endpoint works. Keys stay in environment variables."],
  ["Can mentors be learners too?", "Yes. Roles are USER, MENTOR, and ADMIN. Mentors keep a learner profile."],
];

export function LandingPage() {
  return (
    <div className="bg-mesh relative overflow-x-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 md:px-6">
        <div className="text-lg font-semibold tracking-tight">
          Skill<span className="text-accent">Sync</span>
        </div>
        <nav className="hidden gap-6 text-sm font-medium text-muted md:flex">
          <a className="hover:text-foreground" href="#features">
            Features
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
            <Link to="/login">Login</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/register">Get started</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-8 md:px-6 lg:grid-cols-2 lg:pt-12">
        <div className="min-w-0">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-balance text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl"
          >
            Learn Faster. Find Mentors. <span className="gradient-text">Grow Smarter.</span>
          </motion.h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">AI Powered Peer Learning & Mentor Matching Platform.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link to="/register">Start matching</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#ai">See AI features</a>
            </Button>
          </div>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="relative min-w-0">
          <svg viewBox="0 0 420 320" className="h-auto w-full">
            <defs>
              <linearGradient id="g" x1="0" x2="1">
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="100%" stopColor="#0891B2" />
              </linearGradient>
            </defs>
            <rect x="20" y="30" width="380" height="250" rx="28" fill="url(#g)" opacity="0.2" />
            <circle cx="90" cy="110" r="36" fill="#4F46E5" />
            <circle cx="210" cy="80" r="28" fill="#6D28D9" />
            <circle cx="320" cy="140" r="42" fill="#0891B2" />
            <path d="M90 110 C140 40 250 40 320 140" stroke="#94a3b8" strokeWidth="2" fill="none" />
          </svg>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="glass absolute right-2 top-6 w-44 rounded-ss p-4 sm:right-6 sm:w-48"
          >
            <div className="text-xs text-muted">Match score</div>
            <div className="text-3xl font-semibold">92%</div>
            <div className="mt-1 text-xs font-medium text-success">Spring Boot overlap</div>
          </motion.div>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 5 }}
            className="glass absolute bottom-6 left-2 w-52 rounded-ss p-4 sm:left-6 sm:w-56"
          >
            <div className="text-xs text-muted">AI insight</div>
            <div className="text-sm leading-relaxed">Pair with a mentor who is two levels ahead on your goal stack.</div>
          </motion.div>
        </motion.div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <h2 className="mb-8 text-3xl font-semibold tracking-tight">Platform features</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map(([t, d]) => (
            <div key={t} className="glass rounded-ss p-5 shadow-card">
              <h3 className="font-semibold">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="ai" className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <h2 className="mb-8 text-3xl font-semibold tracking-tight">AI features</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {aiFeatures.map(([t, d]) => (
            <div key={t} className="rounded-ss border border-line bg-primary/10 p-6">
              <h3 className="font-semibold">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <h2 className="mb-8 text-3xl font-semibold tracking-tight">Mentor showcase</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {mentors.map((m) => (
            <div key={m.name} className="glass rounded-ss p-5 shadow-card">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 font-semibold text-primary">
                {m.name.slice(0, 1)}
              </div>
              <div className="font-semibold">{m.name}</div>
              <div className="text-sm text-muted">{m.skill}</div>
              <div className="mt-3 text-sm font-medium text-accent">{m.match}% match</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-16 text-center md:grid-cols-4 md:px-6">
        {[
          ["12k+", "Learners"],
          ["1.8k", "Mentors"],
          ["92%", "Avg match quality"],
          ["4.8", "Session rating"],
        ].map(([n, l]) => (
          <div key={l} className="glass rounded-ss p-6 shadow-card">
            <div className="text-3xl font-semibold tracking-tight">{n}</div>
            <div className="mt-1 text-sm text-muted">{l}</div>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <h2 className="mb-8 text-3xl font-semibold tracking-tight">Testimonials</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            "I found a Spring mentor in a day. The reasons made the match feel fair.",
            "RAG on my notes is the study partner I needed before interviews.",
            "As an admin, the growth charts and audit logs are placement-demo ready.",
          ].map((t) => (
            <blockquote key={t} className="glass rounded-ss p-5 text-sm leading-relaxed text-muted">
              “{t}”
            </blockquote>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto grid max-w-6xl gap-4 px-4 py-16 md:grid-cols-3 md:px-6">
        {[
          ["Starter", "Free", ["3 mentor requests", "AI chat 20 msgs/day"]],
          ["Pro", "$19/mo", ["Unlimited matching", "RAG documents", "Priority mentors"]],
          ["Team", "$49/mo", ["Admin analytics", "SSO-ready JWT", "Audit logs"]],
        ].map(([name, price, items]) => (
          <div key={String(name)} className="glass rounded-ss p-6 shadow-card">
            <div className="text-sm font-medium uppercase tracking-wide text-muted">{name}</div>
            <div className="mt-2 text-3xl font-semibold tracking-tight">{price}</div>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              {(items as string[]).map((i) => (
                <li key={i}>• {i}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section id="faq" className="mx-auto max-w-3xl px-4 py-16 md:px-6">
        <h2 className="mb-8 text-3xl font-semibold tracking-tight">FAQ</h2>
        <div className="space-y-3">
          {faqs.map(([q, a]) => (
            <details key={q} className="glass rounded-ss p-4">
              <summary className="cursor-pointer font-medium">{q}</summary>
              <p className="mt-2 text-sm leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t border-line px-4 py-10 text-sm text-muted md:px-6">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 md:flex-row">
          <div>© {new Date().getFullYear()} SkillSync</div>
          <div className="flex gap-4">
            <Link className="hover:text-foreground" to="/login">
              Login
            </Link>
            <Link className="hover:text-foreground" to="/register">
              Register
            </Link>
            <a className="hover:text-foreground" href="https://github.com">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
