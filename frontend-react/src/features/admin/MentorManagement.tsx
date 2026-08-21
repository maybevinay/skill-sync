import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import api from "@/lib/api";
import { PageHeader } from "@/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/shared/Skeleton";
import { EmptyState } from "@/shared/EmptyState";
import { ErrorState } from "@/shared/ErrorState";
import { MatchRing } from "@/shared/MatchRing";
import { Avatar, availabilityLabel } from "@/lib/ui";

type Mentor = {
  mentorId: number;
  fullName: string;
  headline?: string;
  rating: number;
  reviewCount?: number;
  matchScore: number;
  skills?: string[];
  availability?: string;
};

export function MentorManagement() {
  const mentors = useQuery({
    queryKey: ["mentors-admin"],
    queryFn: async () => (await api.get("/api/mentors")).data as Mentor[],
  });
  return (
    <div>
      <PageHeader title="Mentors" subtitle="Directory of mentor profiles from matching." />
      {mentors.isError ? (
        <ErrorState hint="We couldn't load the mentor directory." onRetry={() => void mentors.refetch()} />
      ) : mentors.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      ) : !mentors.data?.length ? (
        <EmptyState icon={Users} title="No mentors yet" hint="Mentor profiles appear here once they join and complete matching setup." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {mentors.data.map((m) => (
            <div key={m.mentorId} className="flex gap-4 rounded-ss border border-line bg-surface p-5">
              <Avatar name={m.fullName} className="h-12 w-12 text-sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{m.fullName}</div>
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted">{m.headline}</p>
                  </div>
                  <MatchRing value={m.matchScore} size={56} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tone="warning">{`Rating ${m.rating.toFixed(1)}`}</Badge>
                  {m.reviewCount != null && (
                    <Badge>{`${m.reviewCount} review${m.reviewCount === 1 ? "" : "s"}`}</Badge>
                  )}
                  {m.availability && <Badge tone="accent">{availabilityLabel(m.availability)}</Badge>}
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {(m.skills ?? []).slice(0, 5).map((s) => (
                    <span key={s} className="ss-chip">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
