import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/shared/Skeleton";
import { PageHeader } from "@/shared/PageHeader";

export function AdminDashboard() {
  const auth = useQuery({ queryKey: ["admin-stats"], queryFn: async () => (await api.get("/api/admin/stats")).data });
  const matching = useQuery({ queryKey: ["admin-analytics"], queryFn: async () => (await api.get("/api/admin/analytics")).data });
  const ai = useQuery({ queryKey: ["ai-stats"], queryFn: async () => (await api.get("/api/admin/ai-stats")).data });
  const growth = matching.data?.growth ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Admin dashboard" subtitle="Users, mentors, matching volume, and AI usage" />
      {auth.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <Stat label="Users" value={auth.data?.users} />
          <Stat label="Mentors" value={auth.data?.mentors} />
          <Stat label="Profiles" value={matching.data?.profiles} />
          <Stat label="AI chats" value={ai.data?.chatCalls} />
        </div>
      )}
      <Card className="h-80 min-w-0">
        <div className="mb-2 text-sm text-muted">Platform growth</div>
        <div className="h-[calc(100%-1.5rem)] min-h-0 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Area dataKey="users" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.3} />
              <Area dataKey="mentors" stroke="#0891B2" fill="#0891B2" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | undefined }) {
  return (
    <Card>
      <div className="text-sm text-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value ?? "—"}</div>
    </Card>
  );
}
