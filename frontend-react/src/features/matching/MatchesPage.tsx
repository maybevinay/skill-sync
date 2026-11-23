import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { matchingApi } from "@/services/matching.service";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/shared/EmptyState";
import { ErrorState } from "@/shared/ErrorState";
import { PageHeader } from "@/shared/PageHeader";
import { Skeleton } from "@/shared/Skeleton";
import { Button } from "@/components/ui/button";
import { MatchRing } from "@/shared/MatchRing";
import { Avatar } from "@/lib/ui";

type Rec = { mentorId: number; matchScore: number; reasons: string[] };
type Mentor = { mentorId: number; fullName: string; headline: string; skills: string[]; photoUrl?: string };

export function MatchesPage() {
  const recs = useQuery({ queryKey: ["recs"], queryFn: matchingApi.recommendations });
  const mentors = useQuery({ queryKey: ["mentors"], queryFn: () => matchingApi.mentors({}) });
  const byId = new Map<number, Mentor>((mentors.data ?? []).map((m: Mentor) => [m.mentorId, m]));

  return (
    <div>
      <PageHeader
        title="Why these matches"
        subtitle="Skills 50% · Goals 20% · Experience 15% · Availability 10% · Rating 5%"
      />
      {recs.isError ? (
        <ErrorState hint="We couldn't load match explanations." onRetry={() => void recs.refetch()} />
      ) : recs.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : !recs.data?.length ? (
        <EmptyState
          title="No recommendations yet"
          hint="Add skills and learning goals first so matching has something to score."
          action={
            <Button asChild>
              <Link to="/app/skills">Add skills</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {(recs.data as Rec[]).map((m) => {
            const info = byId.get(m.mentorId);
            return (
              <Card key={m.mentorId} className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <Avatar name={info?.fullName ?? `Mentor ${m.mentorId}`} src={info?.photoUrl} />
                  <div className="min-w-0">
                    <div className="font-semibold">{info?.fullName ?? `Mentor #${m.mentorId}`}</div>
                    {info?.headline && <p className="mt-0.5 text-sm text-muted">{info.headline}</p>}
                    <ul className="mt-3 space-y-1 text-sm text-muted">
                      {m.reasons.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {(info?.skills ?? []).slice(0, 6).map((s) => (
                        <span key={s} className="ss-chip">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-center sm:items-end">
                  <MatchRing value={m.matchScore} size={80} />
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">Match score</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
