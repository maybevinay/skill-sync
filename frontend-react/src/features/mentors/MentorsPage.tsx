import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { matchingApi } from "@/services/matching.service";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/shared/EmptyState";
import { Skeleton } from "@/shared/Skeleton";
import { PageHeader } from "@/shared/PageHeader";

type CardRow = {
  mentorId: number;
  fullName: string;
  headline: string;
  country: string;
  experienceYears: number;
  availability: string;
  rating: number;
  matchScore: number;
  skills: string[];
};

export function MentorsPage() {
  const qc = useQueryClient();
  const [skill, setSkill] = useState("");
  const [country, setCountry] = useState("");
  const [minRating, setMinRating] = useState("");
  const mentors = useQuery({
    queryKey: ["mentors", skill, country, minRating],
    queryFn: () => matchingApi.mentors({ skill: skill || undefined, country: country || undefined, minRating: minRating || undefined }),
  });
  const request = useMutation({
    mutationFn: (mentorId: number) => matchingApi.createRequest(mentorId, "I'd like to learn from you."),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["requests"] }),
  });

  return (
    <div className="space-y-4">
      <PageHeader title="Mentor discovery" subtitle="Filter by skill, country, and rating" />
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        <Input placeholder="Skill" value={skill} onChange={(e) => setSkill(e.target.value)} />
        <Input placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
        <Input placeholder="Min rating" value={minRating} onChange={(e) => setMinRating(e.target.value)} />
      </div>
      {mentors.isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      ) : !mentors.data?.length ? (
        <EmptyState title="No mentors found" hint="Try clearing filters or adding skills to your profile." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {mentors.data.map((m: CardRow) => (
            <Card key={m.mentorId} className="flex min-w-0 flex-col">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/15 text-sm font-semibold text-secondary">
                {m.fullName.slice(0, 1)}
              </div>
              <h3 className="font-semibold">{m.fullName}</h3>
              <p className="text-sm text-muted">{m.headline}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {m.skills.map((s) => (
                  <span key={s} className="ss-chip">
                    {s}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex justify-between text-sm text-muted">
                <span>
                  {m.experienceYears} yrs · {m.availability}
                </span>
                <span>★ {m.rating.toFixed(1)}</span>
              </div>
              <div className="mt-2">
                <Badge tone="accent">{`${m.matchScore}% match`}</Badge>
              </div>
              <Button className="mt-4 w-full" onClick={() => request.mutate(m.mentorId)}>
                Request
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
