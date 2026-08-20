import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { PageHeader } from "@/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const fieldLabels: Record<string, string> = {
  fullName: "Full name",
  photoUrl: "Photo URL",
  country: "Country",
  linkedinUrl: "LinkedIn",
  githubUrl: "GitHub",
  portfolioUrl: "Portfolio",
};

export function ProfilePage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["profile"], queryFn: async () => (await api.get("/api/profile/me")).data, retry: false });
  const [form, setForm] = useState({
    fullName: "",
    photoUrl: "",
    bio: "",
    learningGoals: "",
    experienceYears: 0,
    availability: "WEEKNIGHTS",
    country: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
  });

  useEffect(() => {
    if (data) {
      setForm({
        fullName: data.fullName ?? "",
        photoUrl: data.photoUrl ?? "",
        bio: data.bio ?? "",
        learningGoals: data.learningGoals ?? "",
        experienceYears: data.experienceYears ?? 0,
        availability: data.availability ?? "WEEKNIGHTS",
        country: data.country ?? "",
        linkedinUrl: data.linkedinUrl ?? "",
        githubUrl: data.githubUrl ?? "",
        portfolioUrl: data.portfolioUrl ?? "",
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => (await api.put("/api/profile/me", form)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    save.mutate();
  }

  return (
    <div>
      <PageHeader title="Profile" subtitle={`Completion ${data?.completionScore ?? 0}% — keep this current so matching stays accurate.`} />
      <Card>
        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
          {(["fullName", "photoUrl", "country", "linkedinUrl", "githubUrl", "portfolioUrl"] as const).map((k) => (
            <div key={k}>
              <label className="ss-label" htmlFor={k}>
                {fieldLabels[k]}
              </label>
              <Input id={k} placeholder={fieldLabels[k]} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
            </div>
          ))}
          <div className="md:col-span-2">
            <label className="ss-label" htmlFor="bio">
              Bio
            </label>
            <textarea id="bio" className="ss-field" placeholder="A short professional summary" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="ss-label" htmlFor="goals">
              Learning goals
            </label>
            <textarea
              id="goals"
              className="ss-field"
              placeholder="What you want to learn next"
              value={form.learningGoals}
              onChange={(e) => setForm({ ...form, learningGoals: e.target.value })}
            />
          </div>
          <div>
            <label className="ss-label" htmlFor="exp">
              Experience (years)
            </label>
            <Input
              id="exp"
              type="number"
              value={form.experienceYears}
              onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="ss-label" htmlFor="avail">
              Availability
            </label>
            <select id="avail" className="ss-field" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })}>
              <option>WEEKDAYS</option>
              <option>WEEKNIGHTS</option>
              <option>WEEKENDS</option>
              <option>FLEXIBLE</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save profile"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
