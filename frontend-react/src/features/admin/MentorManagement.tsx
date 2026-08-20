import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { PageHeader } from "@/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function MentorManagement() {
  const mentors = useQuery({
    queryKey: ["mentors-admin"],
    queryFn: async () => (await api.get("/api/mentors")).data,
  });
  return (
    <div>
      <PageHeader title="Mentor management" subtitle="Directory of mentor profiles" />
      <div className="grid gap-3 md:grid-cols-2">
        {(mentors.data ?? []).map((m: { mentorId: number; fullName: string; rating: number; matchScore: number }) => (
          <Card key={m.mentorId}>
            <div className="font-semibold">{m.fullName}</div>
            <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted">
              <Badge tone="warning">{`Rating ${m.rating}`}</Badge>
              <Badge tone="accent">{`${m.matchScore}% sample match`}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
