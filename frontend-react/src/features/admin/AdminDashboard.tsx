import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Bot, GitCompare, UserCheck, Users } from "lucide-react";
import api from "@/lib/api";
import { useTheme } from "@/hooks/useTheme";
import { chartTheme } from "@/lib/chartTheme";
import { PageHeader } from "@/shared/PageHeader";
import { Skeleton } from "@/shared/Skeleton";
import { StatCard } from "@/shared/StatCard";
import { ErrorState } from "@/shared/ErrorState";

export function AdminDashboard() {
  const { theme } = useTheme();
  const ink = chartTheme(theme === "dark");
  const auth = useQuery({ queryKey: ["admin-stats"], queryFn: async () => (await api.get("/api/admin/stats")).data });
  const matching = useQuery({ queryKey: ["admin-analytics"], queryFn: async () => (await api.get("/api/admin/analytics")).data });
  const ai = useQuery({ queryKey: ["ai-stats"], queryFn: async () => (await api.get("/api/admin/ai-stats")).data });
  const growth = matching.data?.growth ?? [];
  const failed = auth.isError || matching.isError || ai.isError;

  return (
    <div className="space-y-8">
      <PageHeader title="Overview" subtitle="Users, mentors, matching volume, and AI usage from live services." />
      {failed ? (
        <ErrorState
          hint="We couldn't load admin metrics. Confirm the gateway and services are running."
          onRetry={() => {
            void auth.refetch();
            void matching.refetch();
            void ai.refetch();
          }}
        />
      ) : auth.isLoading || matching.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Users" value={auth.data?.users ?? "—"} icon={<Users className="h-4 w-4 text-primary" />} className="bg-lavender/50" />
          <StatCard label="Mentors" value={auth.data?.mentors ?? "—"} icon={<UserCheck className="h-4 w-4 text-primary" />} className="bg-soft-blue/70" />
          <StatCard
            label="Pending requests"
            value={matching.data?.pendingRequests ?? "—"}
            hint={`${matching.data?.acceptedRequests ?? 0} accepted`}
            icon={<GitCompare className="h-4 w-4 text-primary" />}
          />
          <StatCard label="AI chats" value={ai.data?.chatCalls ?? "—"} icon={<Bot className="h-4 w-4 text-primary" />} className="bg-mint/60" />
        </div>
      )}
      <section>
        <h2 className="mb-4 text-[17px] font-semibold">Platform growth</h2>
        <div className="h-80 min-w-0 rounded-ss border border-line bg-surface p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growth}>
              <CartesianGrid strokeDasharray="3 3" stroke={ink.grid} />
              <XAxis dataKey="month" stroke={ink.axis} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={ink.axis} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "rgb(var(--ss-surface))",
                  border: "1px solid rgb(var(--ss-border))",
                  borderRadius: 12,
                  fontSize: 13,
                }}
              />
              <Area dataKey="users" stroke={ink.primary} fill={ink.primary} fillOpacity={0.12} strokeWidth={2} />
              <Area dataKey="mentors" stroke={ink.secondary} fill={ink.secondary} fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
