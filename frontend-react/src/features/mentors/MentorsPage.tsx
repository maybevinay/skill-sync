import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { matchingApi } from "@/services/matching.service";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/shared/EmptyState";
import { ErrorState } from "@/shared/ErrorState";
import { Skeleton } from "@/shared/Skeleton";
import { PageHeader } from "@/shared/PageHeader";
import { MatchRing } from "@/shared/MatchRing";
import { Avatar, availabilityLabel } from "@/lib/ui";
import { useToast } from "@/components/ui/toast";

type CardRow = {
  mentorId: number;
  fullName: string;
  photoUrl?: string;
  headline: string;
  country: string;
  experienceYears: number;
  availability: string;
  rating: number;
  reviewCount?: number;
  matchScore: number;
  reasons?: string[];
  skills: string[];
};

export function MentorsPage() {
  const qc = useQueryClient();
  const { push } = useToast();
  const [params] = useSearchParams();
  const [skill, setSkill] = useState(params.get("skill") ?? "");
  const [country, setCountry] = useState("");
  const [minRating, setMinRating] = useState("");

  useEffect(() => {
    setSkill(params.get("skill") ?? "");
  }, [params]);

  const mentors = useQuery({
    queryKey: ["mentors", skill, country, minRating],
    queryFn: () => matchingApi.mentors({ skill: skill || undefined, country: country || undefined, minRating: minRating || undefined }),
  });
  const request = useMutation({
    mutationFn: (mentorId: number) => matchingApi.createRequest(mentorId, "I'd like to learn from you."),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requests"] });
      push("Request sent", "success");
    },
    onError: (err) => {
      const msg = (err as { response?: { status?: number } })?.response?.status === 409
        ? "You already have an open request with this mentor."
        : "Could not send the request.";
      push(msg, "danger");
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Discover mentors" subtitle="Filter by skill, country, and rating. Match scores use your live profile." />
      <div className="grid gap-3 sm:grid-cols-3">
        <Input placeholder="Skill" aria-label="Filter by skill" value={skill} onChange={(e) => setSkill(e.target.value)} />
        <Input placeholder="Country" aria-label="Filter by country" value={country} onChange={(e) => setCountry(e.target.value)} />
        <Input placeholder="Min rating" aria-label="Minimum rating" value={minRating} onChange={(e) => setMinRating(e.target.value)} />
      </div>
      {mentors.isError ? (
        <ErrorState hint="We couldn't load mentors." onRetry={() => void mentors.refetch()} />
      ) : mentors.isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      ) : !mentors.data?.length ? (
        <EmptyState
          icon={Users}
          title="No mentors found yet"
          hint="Try clearing filters or adding skills to your profile so we can rank a better set."
          action={
            <Button asChild>
              <Link to="/app/skills">Add skills</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {mentors.data.map((m: CardRow) => (
            <Card key={m.mentorId} hover className="flex min-w-0 flex-col">
              <div className="flex items-start justify-between gap-3">
                <Avatar name={m.fullName} src={m.photoUrl} className="h-12 w-12 text-sm" />
                <MatchRing value={m.matchScore} size={56} />
              </div>
              <h3 className="mt-4 text-[17px] font-semibold">{m.fullName}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{m.headline}</p>
              {m.reasons?.[0] && <p className="mt-2 text-sm text-muted">{m.reasons[0]}</p>}
              <div className="mt-3 flex flex-wrap gap-1">
                {m.skills.slice(0, 5).map((s) => (
                  <span key={s} className="ss-chip">
                    {s}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted">
                {m.experienceYears} yrs · {availabilityLabel(m.availability)}
                {m.country ? ` · ${m.country}` : ""}
              </p>
              <div className="mt-1 text-xs text-muted">
                Rating {m.rating.toFixed(1)}
                {m.reviewCount != null ? ` · ${m.reviewCount} review${m.reviewCount === 1 ? "" : "s"}` : ""}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/app/matches">Match details</Link>
                </Button>
                <Button size="sm" disabled={request.isPending} onClick={() => request.mutate(m.mentorId)}>
                  Connect
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
