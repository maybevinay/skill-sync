import { useQuery } from "@tanstack/react-query";
import { matchingApi } from "@/services/matching.service";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/shared/EmptyState";
import { PageHeader } from "@/shared/PageHeader";
import { Skeleton } from "@/shared/Skeleton";

export function MatchesPage() {
  const recs = useQuery({ queryKey: ["recs"], queryFn: matchingApi.recommendations });
  return (
    <div>
      <PageHeader title="Match recommendations" subtitle="Skill 50% · Goals 20% · Experience 15% · Availability 10% · Rating 5%" />
      {recs.isLoading ? (
        <Skeleton className="h-32" />
      ) : !recs.data?.length ? (
        <EmptyState title="No recommendations" hint="Add skills and learning goals first." />
      ) : (
        <div className="space-y-3">
          {recs.data.map((m: { mentorId: number; matchScore: number; reasons: string[] }) => (
            <Card key={m.mentorId}>
              <div className="flex items-center justify-between gap-3 font-medium">
                <span>Mentor {m.mentorId}</span>
                <Badge tone="accent">{`${m.matchScore}%`}</Badge>
              </div>
              <ul className="ml-5 mt-2 list-disc text-sm text-muted">
                {m.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
