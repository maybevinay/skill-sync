import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles, Target, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { matchingApi } from "@/services/matching.service";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/shared/Skeleton";
import { EmptyState } from "@/shared/EmptyState";
import { ErrorState } from "@/shared/ErrorState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/shared/StatCard";
import { MatchRing } from "@/shared/MatchRing";
import { Avatar, firstName, greeting } from "@/lib/ui";

type Rec = { mentorId: number; matchScore: number; reasons: string[] };
type Mentor = { mentorId: number; fullName: string; headline: string; skills: string[]; availability: string; photoUrl?: string };

export function DashboardPage() {
  const { user } = useAuth();
  const profile = useQuery({ queryKey: ["profile"], queryFn: matchingApi.profile, retry: false });
  const recs = useQuery({
    queryKey: ["recs"],
    queryFn: matchingApi.recommendations,
    retry: false,
    enabled: profile.isSuccess,
  });
  const mentors = useQuery({ queryKey: ["mentors"], queryFn: () => matchingApi.mentors({}), retry: false });
  const requests = useQuery({ queryKey: ["requests"], queryFn: matchingApi.requests, retry: false });

  const topScore = recs.data?.[0]?.matchScore;
  const goals = String(profile.data?.learningGoals ?? "")
    .split(/[,|\n]/)
    .map((s: string) => s.trim())
    .filter(Boolean)
    .slice(0, 6);
  const byId = new Map<number, Mentor>((mentors.data ?? []).map((m: Mentor) => [m.mentorId, m]));
  const pending = (requests.data ?? []).filter((r: { status: string }) => r.status === "PENDING").length;

  return (
    <div className="space-y-10">
      <header>
        <p className="text-sm font-medium text-muted">
          {greeting()}, {firstName(user?.fullName)}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">Ready to level up your skills?</h1>
        <p className="mt-2 max-w-xl text-[15px] text-muted">Your matching profile, recommendations, and assistant — in one place.</p>
      </header>

      {profile.isError ? (
        <ErrorState hint="We couldn't load your dashboard. Check that matching is running." onRetry={() => void profile.refetch()} />
      ) : profile.isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Profile completion"
            value={`${profile.data?.completionScore ?? 0}%`}
            icon={<Target className="h-4 w-4 text-primary" />}
            className="bg-lavender/60"
            hint="Complete bio, goals, and skills to improve matches."
          />
          <div className="rounded-ss border border-line bg-soft-blue/80 p-5">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Users className="h-4 w-4 text-primary" /> Best mentor match
            </div>
            <div className="mt-3 flex items-center gap-4">
              {topScore != null ? <MatchRing value={topScore} size={72} /> : <div className="text-4xl font-semibold tracking-tight">—</div>}
              <p className="text-sm text-muted">
                {pending} pending request{pending === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <Link to="/app/ai" className="block min-w-0">
            <Card hover className="h-full bg-mint/70">
              <div className="flex items-center gap-2 text-sm text-muted">
                <Sparkles className="h-4 w-4 text-primary" /> AI Assistant
              </div>
              <p className="mt-3 text-[17px] font-medium">Ask SkillSync anything about skills or mentors</p>
              <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Open chat <ArrowRight className="h-4 w-4" />
              </p>
            </Card>
          </Link>
        </div>
      )}

      <Link
        to="/app/ai"
        className="flex items-center gap-3 rounded-ss border border-line bg-surface px-4 py-3 hover:border-primary/30"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lavender text-primary">
          <Sparkles className="h-4 w-4" />
        </div>
        <span className="flex-1 text-sm text-muted">Ask SkillSync anything…</span>
        <span className="text-sm font-medium text-primary">Open</span>
      </Link>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Recommended mentors</h2>
            <p className="mt-1 text-sm text-muted">Ranked from your live matching profile.</p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/app/mentors">See all</Link>
          </Button>
        </div>
        {recs.isError ? (
          <ErrorState hint="We couldn't load your mentor recommendations." onRetry={() => void recs.refetch()} />
        ) : recs.isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-44" />
            <Skeleton className="h-44" />
            <Skeleton className="h-44" />
          </div>
        ) : !recs.data?.length ? (
          <EmptyState
            title="No matches yet"
            hint="Add skills and learning goals so we can rank mentors for you."
            action={
              <Button asChild>
                <Link to="/app/profile">Complete profile</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {(recs.data as Rec[]).slice(0, 3).map((r) => {
              const m = byId.get(r.mentorId);
              return (
                <Card key={r.mentorId} hover>
                  <div className="flex items-start justify-between gap-3">
                    <Avatar name={m?.fullName ?? `Mentor ${r.mentorId}`} src={m?.photoUrl} />
                    <Badge tone="accent">{`${r.matchScore}% match`}</Badge>
                  </div>
                  <h3 className="mt-3 font-semibold">{m?.fullName ?? `Mentor #${r.mentorId}`}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{m?.headline || r.reasons[0]}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(m?.skills ?? []).slice(0, 4).map((s) => (
                      <span key={s} className="ss-chip">
                        {s}
                      </span>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {goals.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">Learning goals</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {goals.map((g) => (
              <span key={g} className="rounded-xl bg-soft-yellow px-3 py-2 text-sm">
                {g}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
