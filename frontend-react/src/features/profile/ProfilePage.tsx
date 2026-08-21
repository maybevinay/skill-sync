import { FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { PageHeader } from "@/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Avatar } from "@/lib/ui";
import { isLocalPhotoPath, readPhotoFile } from "@/lib/photo";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/shared/ErrorState";
import { Skeleton } from "@/shared/Skeleton";

const links = ["linkedinUrl", "githubUrl", "portfolioUrl"] as const;
const labels: Record<(typeof links)[number], string> = {
  linkedinUrl: "LinkedIn",
  githubUrl: "GitHub",
  portfolioUrl: "Portfolio",
};

type Skill = { skillId: number; name: string; level: string; progress: number };

export function ProfilePage() {
  const { user } = useAuth();
  const { push } = useToast();
  const qc = useQueryClient();
  const { data, isError, isLoading, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await api.get("/api/profile/me")).data,
    retry: false,
  });
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

  const photoInput = useRef<HTMLInputElement>(null);

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
    mutationFn: async () => {
      if (isLocalPhotoPath(form.photoUrl)) {
        throw new Error("local-photo");
      }
      return (await api.put("/api/profile/me", form)).data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      push("Profile saved", "success");
    },
    onError: (err: Error) => {
      push(
        err.message === "local-photo"
          ? "Use Upload photo instead of a file path from your computer."
          : "Could not save profile.",
        "danger",
      );
    },
  });

  async function onPickPhoto(file?: File) {
    if (!file) return;
    try {
      const photoUrl = await readPhotoFile(file);
      setForm((current) => ({ ...current, photoUrl }));
      push("Photo ready. Save profile to keep it.", "success");
    } catch (err) {
      push(err instanceof Error ? err.message : "Could not read that image.", "danger");
    } finally {
      if (photoInput.current) photoInput.current.value = "";
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    save.mutate();
  }

  if (isError) {
    return (
      <div>
        <PageHeader title="Profile" />
        <ErrorState hint="We couldn't load your profile." onRetry={() => void refetch()} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const skills: Skill[] = data?.skills ?? [];

  return (
    <div className="space-y-10">
      <PageHeader title="Profile" subtitle={`Completion ${data?.completionScore ?? 0}% — matching uses this information.`} />

      <section className="flex flex-wrap items-center gap-4">
        <Avatar name={form.fullName || user?.fullName} src={form.photoUrl || undefined} className="h-16 w-16 text-base" />
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold">{form.fullName || user?.fullName}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge tone="primary">{user?.role ?? "USER"}</Badge>
            {data?.mentor && <Badge tone="accent">Mentor</Badge>}
            <span className="text-sm text-muted">{user?.email}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              ref={photoInput}
              id="photoFile"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => void onPickPhoto(e.target.files?.[0])}
            />
            <Button type="button" variant="outline" size="sm" onClick={() => photoInput.current?.click()}>
              Upload photo
            </Button>
            {form.photoUrl ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => setForm({ ...form, photoUrl: "" })}>
                Remove photo
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      {form.bio && <p className="max-w-2xl text-[15px] leading-relaxed text-muted">{form.bio}</p>}

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <h3 className="text-[17px] font-semibold">Skills</h3>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/app/skills">Manage</Link>
          </Button>
        </div>
        {skills.length ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span key={s.skillId} className="ss-chip">
                {s.name} · {s.level} · {s.progress}%
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">
            No skills yet.{" "}
            <Link className="font-medium text-primary" to="/app/skills">
              Add skills
            </Link>{" "}
            so matching can rank mentors.
          </p>
        )}
      </section>

      <form onSubmit={onSubmit} className="space-y-10">
        <section>
          <h3 className="mb-4 text-[17px] font-semibold">About</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Field id="fullName" label="Full name">
              <Input id="fullName" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </Field>
            <Field id="country" label="Country">
              <Input id="country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </Field>
            <div className="md:col-span-2">
              <Field id="bio" label="Bio">
                <textarea id="bio" className="ss-field" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              </Field>
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-4 text-[17px] font-semibold">Learning</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Field id="goals" label="Learning goals">
                <textarea
                  id="goals"
                  className="ss-field"
                  value={form.learningGoals}
                  onChange={(e) => setForm({ ...form, learningGoals: e.target.value })}
                />
              </Field>
            </div>
            <Field id="exp" label="Experience (years)">
              <Input
                id="exp"
                type="number"
                value={form.experienceYears}
                onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })}
              />
            </Field>
            <Field id="avail" label="Availability">
              <select id="avail" className="ss-field" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })}>
                <option>WEEKDAYS</option>
                <option>WEEKNIGHTS</option>
                <option>WEEKENDS</option>
                <option>FLEXIBLE</option>
              </select>
            </Field>
          </div>
        </section>

        <section>
          <h3 className="mb-4 text-[17px] font-semibold">Links</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Field id="photoUrl" label="Photo URL" hint="Or paste an https image link. Local file paths will not display.">
              <Input id="photoUrl" value={form.photoUrl.startsWith("data:image/") ? "" : form.photoUrl} placeholder="https://…" onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} />
            </Field>
            {links.map((k) => (
              <Field key={k} id={k} label={labels[k]}>
                <Input id={k} value={form[k] ?? ""} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
              </Field>
            ))}
          </div>
        </section>

        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save profile"}
        </Button>
      </form>
    </div>
  );
}
