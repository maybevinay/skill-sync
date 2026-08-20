import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { matchingApi } from "@/services/matching.service";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/shared/EmptyState";
import { PageHeader } from "@/shared/PageHeader";

type Req = { id: number; learnerName: string; mentorName: string; message: string; status: string };

function statusTone(status: string): "warning" | "success" | "danger" | "primary" | "neutral" {
  if (status === "PENDING") return "warning";
  if (status === "ACCEPTED") return "success";
  if (status === "DECLINED") return "danger";
  if (status === "COMPLETED") return "primary";
  return "neutral";
}

export function RequestsPage() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["requests"], queryFn: matchingApi.requests });
  const update = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => matchingApi.updateRequest(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["requests"] }),
  });
  return (
    <div>
      <PageHeader title="Requests" subtitle="Accept, decline, or complete mentorship requests." />
      {!list.data?.length ? (
        <EmptyState title="No requests yet" hint="Discover mentors and send a request." />
      ) : (
        <div className="space-y-3">
          {list.data.map((r: Req) => (
            <Card key={r.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <span className="font-medium">
                  {r.learnerName} → {r.mentorName}
                </span>
                <Badge tone={statusTone(r.status)}>{r.status}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted">{r.message}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["ACCEPTED", "DECLINED", "COMPLETED"].map((s) => (
                  <Button key={s} variant="outline" size="sm" onClick={() => update.mutate({ id: r.id, status: s })}>
                    {s}
                  </Button>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
