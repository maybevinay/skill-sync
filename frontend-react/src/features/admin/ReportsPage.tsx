import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/shared/PageHeader";
import { EmptyState } from "@/shared/EmptyState";

export function ReportsPage() {
  const logs = useQuery({
    queryKey: ["audit"],
    queryFn: async () => (await api.get("/api/admin/audit-logs", { params: { page: 0, size: 25 } })).data,
  });
  const content = logs.data?.content ?? [];
  return (
    <div>
      <PageHeader title="Reports & audit logs" />
      {!content.length ? (
        <EmptyState title="No audit events" hint="Logins, role changes, and profile updates appear here." />
      ) : (
        <div className="space-y-2">
          {content.map((l: { id: number; action: string; details: string; createdAt: string }) => (
            <Card key={l.id} className="p-4 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="accent">{l.action}</Badge>
                <span>{l.details}</span>
              </div>
              <div className="mt-1 text-xs text-muted">{l.createdAt}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
