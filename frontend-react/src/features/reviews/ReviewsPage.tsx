import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { matchingApi } from "@/services/matching.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/shared/PageHeader";
import { EmptyState } from "@/shared/EmptyState";

export function ReviewsPage() {
  const qc = useQueryClient();
  const requests = useQuery({ queryKey: ["requests"], queryFn: matchingApi.requests });
  const reviews = useQuery({ queryKey: ["reviews"], queryFn: matchingApi.reviews });
  const [requestId, setRequestId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const save = useMutation({
    mutationFn: () => matchingApi.addReview({ requestId: Number(requestId), rating, comment }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews"] });
      qc.invalidateQueries({ queryKey: ["requests"] });
    },
  });
  function onSubmit(e: FormEvent) {
    e.preventDefault();
    save.mutate();
  }
  return (
    <div className="space-y-6">
      <PageHeader title="Reviews" subtitle="Rate completed mentoring sessions" />
      <Card className="max-w-xl space-y-3">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="ss-label" htmlFor="review-request">
              Request
            </label>
            <select id="review-request" className="ss-field" value={requestId} onChange={(e) => setRequestId(e.target.value)}>
              <option value="">Select request</option>
              {(requests.data ?? []).map((r: { id: number; mentorName: string }) => (
                <option key={r.id} value={r.id}>
                  #{r.id} {r.mentorName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="ss-label" htmlFor="review-rating">
              Rating (1–5)
            </label>
            <Input
              id="review-rating"
              type="number"
              min={1}
              max={5}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="ss-label" htmlFor="review-comment">
              Comment
            </label>
            <textarea
              id="review-comment"
              className="ss-field"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the session?"
            />
          </div>
          <Button type="submit">Submit review</Button>
        </form>
      </Card>
      {!reviews.data?.length ? (
        <EmptyState title="No reviews yet" hint="Complete a session, then leave a rating." />
      ) : (
        <div className="space-y-2">
          {reviews.data.map((r: { id: number; reviewerName: string; rating: number; comment: string }) => (
            <Card key={r.id}>
              <div className="text-sm font-medium">
                ★ {r.rating} · {r.reviewerName}
              </div>
              <p className="mt-1 text-sm text-muted">{r.comment}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
