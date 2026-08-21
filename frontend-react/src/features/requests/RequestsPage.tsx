import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { matchingApi } from "@/services/matching.service";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/shared/EmptyState";
import { ErrorState } from "@/shared/ErrorState";
import { PageHeader } from "@/shared/PageHeader";
import { Skeleton } from "@/shared/Skeleton";
import { ConfirmDialog } from "@/components/ui/field";
import { useAuth } from "@/hooks/useAuth";
import { apiErrorMessage } from "@/lib/api";
import { Avatar, formatDate } from "@/lib/ui";

type Req = {
  id: number;
  learnerUserId: number;
  learnerName: string;
  mentorName: string;
  message: string;
  status: string;
  createdAt?: string;
};

function statusTone(status: string): "warning" | "success" | "danger" | "primary" | "neutral" {
  if (status === "PENDING") return "warning";
  if (status === "ACCEPTED") return "success";
  if (status === "DECLINED") return "danger";
  if (status === "COMPLETED") return "primary";
  return "neutral";
}

const labels: Record<string, string> = {
  ACCEPTED: "Accept",
  DECLINED: "Decline",
  COMPLETED: "Complete",
};

export function RequestsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [pending, setPending] = useState<{ id: number; status: string } | null>(null);
  const list = useQuery({ queryKey: ["requests"], queryFn: matchingApi.requests });
  const update = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => matchingApi.updateRequest(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requests"] });
      setPending(null);
    },
  });

  function actions(r: Req): string[] {
    const isMentorOwner = r.learnerUserId !== user?.id;
    if (r.status === "PENDING" && (isMentorOwner || user?.role === "ADMIN")) {
      return ["ACCEPTED", "DECLINED"];
    }
    if (r.status === "ACCEPTED") {
      return ["COMPLETED"];
    }
    return [];
  }

  return (
    <div>
      <PageHeader title="Requests" subtitle="Accept, decline, or complete mentorship requests." />
      {update.isError && (
        <p className="mb-4 rounded-xl bg-rose px-3 py-2 text-sm text-danger" role="alert">
          {apiErrorMessage(update.error, "Could not update the request.")}
        </p>
      )}
      {list.isError ? (
        <ErrorState hint="We couldn't load requests." onRetry={() => void list.refetch()} />
      ) : list.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : !list.data?.length ? (
        <EmptyState
          title="No requests yet"
          hint="Once you connect with mentors, they'll appear here."
          action={
            <Button asChild>
              <Link to="/app/mentors">Discover mentors</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {list.data.map((r: Req) => (
            <Card key={r.id} className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <Avatar name={r.learnerName} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">
                    {r.learnerName} → {r.mentorName}
                  </span>
                  <Badge tone={statusTone(r.status)}>{r.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted">{r.message}</p>
                {r.createdAt && <p className="mt-1 text-xs text-muted-2">{formatDate(r.createdAt)}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {actions(r).map((s) => (
                    <Button key={s} variant={s === "DECLINED" ? "outline" : "default"} size="sm" onClick={() => setPending({ id: r.id, status: s })}>
                      {labels[s] ?? s}
                    </Button>
                  ))}
                  {r.status === "PENDING" && r.learnerUserId === user?.id && (
                    <p className="self-center text-sm text-muted">Waiting for the mentor to accept.</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {pending && (
        <ConfirmDialog
          title={`${labels[pending.status] ?? pending.status} this request?`}
          body="This updates the mentorship request status for both people."
          confirmLabel={labels[pending.status] ?? pending.status}
          danger={pending.status === "DECLINED"}
          onClose={() => setPending(null)}
          onConfirm={() => update.mutate(pending)}
        />
      )}
    </div>
  );
}
