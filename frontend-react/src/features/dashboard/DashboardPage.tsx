import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { matchingApi } from "@/services/matching.service";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/shared/Skeleton";
import { EmptyState } from "@/shared/EmptyState";
import { PageHeader } from "@/shared/PageHeader";
import { Badge } from "@/components/ui/badge";

export function DashboardPage() {
  const { user } = useAuth();
  const profile = useQuery({ queryKey: ["profile"], queryFn: matchingApi.profile, retry: false });
  const recs = useQuery({
    queryKey: ["recs"],
    queryFn: matchingApi.recommendations,
    retry: false,
    enabled: profile.isSuccess,
  });

  return (
    <div className="space-y-6">
      <PageHeader title={`Hello, ${user?.fullName}`} subtitle="Your matching and learning snapshot" />
      {profile.isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <div className="text-sm text-muted">Profile completion</div>
            <div className="mt-2 text-3xl font-semibold tracking-tight">{profile.data?.completionScore ?? 0}%</div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-foreground/10">
              <div className="h-2 rounded-full bg-accent" style={{ width: `${profile.data?.completionScore ?? 0}%` }} />
            </div>
          </Card>
          <Card>
            <div className="text-sm text-muted">Role</div>
            <div className="mt-2 text-3xl font-semibold tracking-tight">{user?.role}</div>
            <div className="mt-3">
              <Badge tone="primary">{user?.role ?? "USER"}</Badge>
            </div>
          </Card>
          <Link to="/app/ai" className="block min-w-0">
            <Card className="h-full hover:border-primary/40">
              <div className="text-sm text-muted">AI Assistant</div>
              <div className="mt-2 font-medium">Ask anything about skills or mentors →</div>
            </Card>
          </Link>
        </div>
      )}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Top matches</h2>
        {!recs.data?.length ? (
          <EmptyState title="No matches yet" hint="Complete your profile and skills to unlock recommendations." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {recs.data.slice(0, 4).map((m: { mentorId: number; matchScore: number; reasons: string[] }) => (
              <Card key={m.mentorId}>
                <div className="flex items-start justify-between gap-3">
                  <span className="font-medium">Mentor #{m.mentorId}</span>
                  <Badge tone="accent">{`${m.matchScore}%`}</Badge>
                </div>
                <ul className="mt-2 space-y-1 text-xs text-muted">
                  {m.reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
