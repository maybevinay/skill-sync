import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/shared/PageHeader";
import { EmptyState } from "@/shared/EmptyState";
import { ErrorState } from "@/shared/ErrorState";
import { Skeleton } from "@/shared/Skeleton";
import { formatDate } from "@/lib/ui";

export function ReportsPage() {
  const logs = useQuery({
    queryKey: ["audit"],
    queryFn: async () => (await api.get("/api/admin/audit-logs", { params: { page: 0, size: 25 } })).data,
  });
  const content = logs.data?.content ?? [];
  return (
    <div>
      <PageHeader title="Reports" subtitle="Logins, role changes, and profile updates." />
      {logs.isError ? (
        <ErrorState hint="We couldn't load audit events." onRetry={() => void logs.refetch()} />
      ) : logs.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : !content.length ? (
        <EmptyState title="No audit events yet" hint="Logins, role changes, and profile updates appear here." />
      ) : (
        <div className="overflow-x-auto rounded-ss border border-line bg-surface">
          <table className="ss-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Details</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {content.map((l: { id: number; action: string; details: string; createdAt: string }) => (
                <tr key={l.id}>
                  <td>
                    <Badge tone="accent">{l.action}</Badge>
                  </td>
                  <td className="text-sm">{l.details}</td>
                  <td className="whitespace-nowrap text-sm text-muted">{formatDate(l.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
