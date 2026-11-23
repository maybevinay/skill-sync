import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { matchingApi } from "@/services/matching.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/shared/PageHeader";
import { EmptyState } from "@/shared/EmptyState";
import { Field } from "@/components/ui/field";
import { Skeleton } from "@/shared/Skeleton";
import { useAuth } from "@/hooks/useAuth";
import { apiErrorMessage } from "@/lib/api";

type Req = {
  id: number;
  learnerUserId: number;
  mentorName: string;
  status: string;
};

type ReviewRow = { id: number; requestId?: number; reviewerName: string; rating: number; comment: string };

export function ReviewsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const requests = useQuery({ queryKey: ["requests"], queryFn: matchingApi.requests });
  const reviews = useQuery({ queryKey: ["reviews"], queryFn: matchingApi.reviews });
  const [requestId, setRequestId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState("");

  const reviewedIds = useMemo(
    () => new Set((reviews.data ?? []).map((r: ReviewRow) => r.requestId).filter(Boolean)),
    [reviews.data],
  );
  const reviewable = (requests.data ?? []).filter(
    (r: Req) =>
      r.learnerUserId === user?.id &&
      (r.status === "ACCEPTED" || r.status === "COMPLETED") &&
      !reviewedIds.has(r.id),
  );

  const save = useMutation({
    mutationFn: () => matchingApi.addReview({ requestId: Number(requestId), rating, comment: comment.trim() }),
    onSuccess: () => {
      setComment("");
      setRequestId("");
      setFormError("");
      qc.invalidateQueries({ queryKey: ["reviews"] });
      qc.invalidateQueries({ queryKey: ["requests"] });
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!requestId) {
      setFormError("Select a completed or accepted request first.");
      return;
    }
    if (!comment.trim()) {
      setFormError("Add a short comment about the session.");
      return;
    }
    save.mutate();
  }

  const error = formError || (save.isError ? apiErrorMessage(save.error, "Could not submit review.") : "");

  return (
    <div className="space-y-8">
      <PageHeader title="Reviews" subtitle="Rate completed mentoring sessions." />
      <section className="max-w-xl">
        <h2 className="mb-4 text-[17px] font-semibold">Write a review</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field id="review-request" label="Request">
            <select id="review-request" className="ss-field" required value={requestId} onChange={(e) => setRequestId(e.target.value)}>
              <option value="">Select request</option>
              {reviewable.map((r: Req) => (
                <option key={r.id} value={r.id}>
                  #{r.id} {r.mentorName} ({r.status})
                </option>
              ))}
            </select>
          </Field>
          <Field id="review-rating" label="Rating (1–5)">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`h-10 w-10 rounded-xl border text-sm font-medium ${rating === n ? "border-primary bg-lavender text-primary" : "border-line hover:bg-surface-2"}`}
                  onClick={() => setRating(n)}
                  aria-label={`Rate ${n} of 5`}
                  aria-pressed={rating === n}
                >
                  {n}
                </button>
              ))}
            </div>
          </Field>
          <Field id="review-comment" label="Comment">
            <textarea
              id="review-comment"
              className="ss-field"
              required
              minLength={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the session?"
            />
          </Field>
          {error && (
            <p className="rounded-xl bg-rose px-3 py-2 text-sm text-danger" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={save.isPending || reviewable.length === 0}>
            {save.isPending ? "Submitting…" : "Submit review"}
          </Button>
        </form>
      </section>
      {reviews.isLoading || requests.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : reviewable.length === 0 && !reviews.data?.length ? (
        <EmptyState title="No reviewable sessions" hint="Ask a mentor to accept your request, or complete an accepted session on Requests." />
      ) : !reviews.data?.length ? (
        <EmptyState title="No reviews yet" hint="Select a request above, add a comment, then submit." />
      ) : (
        <section className="space-y-3">
          <h2 className="text-[17px] font-semibold">Recent reviews</h2>
          {reviews.data.map((r: ReviewRow) => (
            <Card key={r.id}>
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="text-primary">{r.rating}/5</span>
                <span className="text-muted">· {r.reviewerName}</span>
              </div>
              <p className="mt-1 text-sm text-muted">{r.comment}</p>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
