import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, Pie, PieChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "@/lib/api";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/shared/PageHeader";

const COLORS = ["#4F46E5", "#6D28D9", "#0891B2", "#059669", "#DC2626"];

export function AnalyticsPage() {
  const matching = useQuery({ queryKey: ["admin-analytics"], queryFn: async () => (await api.get("/api/admin/analytics")).data });
  const ai = useQuery({ queryKey: ["ai-stats"], queryFn: async () => (await api.get("/api/admin/ai-stats")).data });
  const trends = matching.data?.skillTrends ?? [];
  const pie = [
    { name: "Chat", value: Number(ai.data?.chatCalls ?? 0) },
    { name: "Sessions", value: Number(ai.data?.sessions ?? 0) },
    { name: "Docs", value: Number(ai.data?.documents ?? 0) },
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Skill demand and AI usage" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="h-80 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trends.map((t: { name: string }, i: number) => ({ name: t.name, count: 8 + i * 3 }))}>
              <XAxis dataKey="name" stroke="#94a3b8" interval={0} angle={-25} textAnchor="end" height={70} />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="count" fill="#6D28D9" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="h-80 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pie} dataKey="value" nameKey="name" outerRadius={90} label>
                {pie.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
