import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { PageHeader } from "@/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/shared/EmptyState";
import { ErrorState } from "@/shared/ErrorState";
import { Skeleton } from "@/shared/Skeleton";
import { useToast } from "@/components/ui/toast";

type Skill = { id: number; name: string; category: string; description: string };
type Profile = { skills: { skillId: number; name: string; category: string; level: string; progress: number }[] };

export function SkillsPage() {
  const qc = useQueryClient();
  const { push } = useToast();
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(q.trim()), 250);
    return () => window.clearTimeout(t);
  }, [q]);
  const skills = useQuery({ queryKey: ["skills", debounced], queryFn: async () => (await api.get("/api/skills", { params: { q: debounced || undefined } })).data as Skill[] });
  const profile = useQuery({ queryKey: ["profile"], queryFn: async () => (await api.get("/api/profile/me")).data as Profile, retry: false });

  const add = useMutation({
    mutationFn: async (skillId: number) => api.post("/api/profile/me/skills", { skillId, level: "INTERMEDIATE", progress: 40 }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      push("Skill added", "success");
    },
    onError: () => push("Could not add that skill.", "danger"),
  });
  const remove = useMutation({
    mutationFn: async (skillId: number) => api.delete(`/api/profile/me/skills/${skillId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
  const mine = new Set((profile.data?.skills ?? []).map((s) => s.skillId));

  return (
    <div className="space-y-8">
      <PageHeader title="Skills" subtitle="Your stack drives matching. Click a chip to remove it from your profile." />
      {profile.isError ? (
        <ErrorState hint="We couldn't load your skills." onRetry={() => void profile.refetch()} />
      ) : profile.isLoading ? (
        <Skeleton className="h-28" />
      ) : profile.data?.skills?.length ? (
        <section>
          <h2 className="mb-3 text-[17px] font-semibold">On your profile</h2>
          <div className="flex flex-wrap gap-2">
            {profile.data.skills.map((s) => (
              <button
                key={s.skillId}
                type="button"
                onClick={() => remove.mutate(s.skillId)}
                className="ss-chip hover:border-danger/40 hover:text-danger"
                title={`Remove ${s.name}`}
              >
                {s.name} · {s.level}
              </button>
            ))}
          </div>
          <div className="mt-6 space-y-4">
            {profile.data.skills.map((s) => (
              <div key={`p-${s.skillId}`}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span>{s.name}</span>
                  <span className="text-muted">{s.progress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-lavender">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${s.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <EmptyState title="No skills yet" hint="Search the catalog below and add the skills you want to learn or teach." />
      )}
      <section>
        <h2 className="mb-3 text-[17px] font-semibold">Catalog</h2>
        <Input placeholder="Search catalog" aria-label="Search skill catalog" value={q} onChange={(e) => setQ(e.target.value)} />
        {skills.isError ? (
          <ErrorState hint="We couldn't load the skill catalog." onRetry={() => void skills.refetch()} />
        ) : skills.isLoading ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : !skills.data?.length ? (
          <EmptyState title="No skills in this search" hint="Try a different keyword, or clear the search to see the full catalog." />
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {skills.data.map((s) => (
              <Card key={s.id} className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs uppercase tracking-wide text-muted">{s.category}</div>
                  <p className="mt-1 text-sm text-muted">{s.description}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={add.isPending || mine.has(s.id)}
                  onClick={() => add.mutate(s.id)}
                >
                  {mine.has(s.id) ? "Added" : add.isPending ? "Adding…" : "Add"}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
