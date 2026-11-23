import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import api from "@/lib/api";
import { useTheme } from "@/hooks/useTheme";
import { chartTheme } from "@/lib/chartTheme";
import { PageHeader } from "@/shared/PageHeader";
import { Skeleton } from "@/shared/Skeleton";
import { ErrorState } from "@/shared/ErrorState";
import { EmptyState } from "@/shared/EmptyState";
import { StatCard } from "@/shared/StatCard";

export function AnalyticsPage() {
  const { theme } = useTheme();
  const ink = chartTheme(theme === "dark");
  const matching = useQuery({ queryKey: ["admin-analytics"], queryFn: async () => (await api.get("/api/admin/analytics")).data });
  const ai = useQuery({ queryKey: ["ai-stats"], queryFn: async () => (await api.get("/api/admin/ai-stats")).data });
  const trends: Array<{ name: string; category: string }> = matching.data?.skillTrends ?? [];
  const pie = [
    { name: "Chat", value: Number(ai.data?.chatCalls ?? 0) },
    { name: "Sessions", value: Number(ai.data?.sessions ?? 0) },
    { name: "Docs", value: Number(ai.data?.documents ?? 0) },
  ];
  const colors = [ink.primary, ink.secondary, ink.mint];
  const byCategory = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const t of trends) {
      const list = map.get(t.category) ?? [];
      list.push(t.name);
      map.set(t.category, list);
    }
    return [...map.entries()];
  }, [trends]);

  return (
    <div className="space-y-8">
      <PageHeader title="Analytics" subtitle="Skill catalog and AI usage from live services." />
      {matching.isError || ai.isError ? (
        <ErrorState
          hint="We couldn't load analytics."
          onRetry={() => {
            void matching.refetch();
            void ai.refetch();
          }}
        />
      ) : matching.isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Skills in catalog" value={matching.data?.skills ?? "—"} />
            <StatCard label="Profiles" value={matching.data?.profiles ?? "—"} />
            <StatCard label="Mentors" value={matching.data?.mentors ?? "—"} />
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            <section>
              <h2 className="mb-4 text-[17px] font-semibold">Skill catalog</h2>
              {!byCategory.length ? (
                <EmptyState title="No skills yet" hint="Skills appear here after they are seeded or created." />
              ) : (
                <div className="space-y-5">
                  {byCategory.map(([category, names]) => (
                    <div key={category}>
                      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">{category}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {names.map((n) => (
                          <span key={n} className="ss-chip">
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
            <section>
              <h2 className="mb-4 text-[17px] font-semibold">AI usage</h2>
              <div className="h-72 rounded-ss border border-line bg-surface p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pie} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={3}>
                      {pie.map((_, i) => (
                        <Cell key={i} fill={colors[i % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "rgb(var(--ss-surface))",
                        border: "1px solid rgb(var(--ss-border))",
                        borderRadius: 12,
                        fontSize: 13,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted">
                {pie.map((p, i) => (
                  <span key={p.name} className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: colors[i] }} />
                    {p.name}: {p.value}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
