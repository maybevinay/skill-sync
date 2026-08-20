import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { PageHeader } from "@/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Skill = { id: number; name: string; category: string; description: string };
type Profile = { skills: { skillId: number; name: string; category: string; level: string; progress: number }[] };

export function SkillsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const skills = useQuery({ queryKey: ["skills", q], queryFn: async () => (await api.get("/api/skills", { params: { q } })).data as Skill[] });
  const profile = useQuery({ queryKey: ["profile"], queryFn: async () => (await api.get("/api/profile/me")).data as Profile, retry: false });

  const add = useMutation({
    mutationFn: async (skillId: number) => api.post("/api/profile/me/skills", { skillId, level: "INTERMEDIATE", progress: 40 }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
  const remove = useMutation({
    mutationFn: async (skillId: number) => api.delete(`/api/profile/me/skills/${skillId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Skills" subtitle="Your stack drives matching. Click a chip to remove it from your profile." />
      <div className="flex flex-wrap gap-2">
        {profile.data?.skills.map((s) => (
          <button
            key={s.skillId}
            onClick={() => remove.mutate(s.skillId)}
            className="ss-chip hover:border-danger/40 hover:text-danger"
            title={`Remove ${s.name}`}
          >
            {s.name} · {s.level}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {profile.data?.skills.map((s) => (
          <div key={`p-${s.skillId}`}>
            <div className="mb-1.5 flex justify-between text-sm">
              <span>{s.name}</span>
              <span className="text-muted">{s.progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-foreground/10">
              <div className="h-2 rounded-full bg-success" style={{ width: `${s.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
      <Input placeholder="Search catalog" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="grid gap-3 md:grid-cols-2">
        {skills.data?.map((s) => (
          <Card key={s.id} className="flex items-start justify-between gap-3 p-4">
            <div className="min-w-0">
              <div className="font-medium">{s.name}</div>
              <div className="text-xs uppercase tracking-wide text-muted">{s.category}</div>
              <p className="mt-1 text-sm text-muted">{s.description}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => add.mutate(s.id)}>
              Add
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
