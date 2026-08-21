import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { PageHeader } from "@/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/field";
import { Skeleton } from "@/shared/Skeleton";
import { EmptyState } from "@/shared/EmptyState";
import { ErrorState } from "@/shared/ErrorState";
import { Avatar } from "@/lib/ui";

type User = { id: number; fullName: string; email: string; role: string; enabled: boolean };

export function UserManagement() {
  const qc = useQueryClient();
  const [pending, setPending] = useState<User | null>(null);
  const users = useQuery({ queryKey: ["admin-users"], queryFn: async () => (await api.get("/api/admin/users")).data as User[] });
  const toggle = useMutation({
    mutationFn: async (u: User) => api.patch(`/api/admin/users/${u.id}/enabled`, null, { params: { enabled: !u.enabled } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setPending(null);
    },
  });
  const role = useMutation({
    mutationFn: async ({ id, role }: { id: number; role: string }) => api.patch(`/api/admin/users/${id}/role`, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  return (
    <div>
      <PageHeader title="Users" subtitle="Roles and account status. Changes apply immediately." />
      {users.isError ? (
        <ErrorState hint="We couldn't load the user directory." onRetry={() => void users.refetch()} />
      ) : users.isLoading ? (
        <Skeleton className="h-64" />
      ) : !users.data?.length ? (
        <EmptyState title="No users yet" hint="Accounts appear here after registration." />
      ) : (
        <div className="overflow-x-auto rounded-ss border border-line bg-surface">
          <table className="ss-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.data.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar name={u.fullName} className="h-8 w-8 text-[10px]" />
                      <span className="font-medium">{u.fullName}</span>
                    </div>
                  </td>
                  <td className="text-muted">{u.email}</td>
                  <td>
                    <select
                      aria-label={`Role for ${u.fullName}`}
                      value={u.role}
                      onChange={(e) => role.mutate({ id: u.id, role: e.target.value })}
                      className="ss-field min-h-0 w-auto py-1.5"
                    >
                      <option>USER</option>
                      <option>MENTOR</option>
                      <option>ADMIN</option>
                    </select>
                  </td>
                  <td>
                    <Button variant="outline" size="sm" onClick={() => setPending(u)}>
                      <Badge tone={u.enabled ? "success" : "danger"}>{u.enabled ? "Enabled" : "Disabled"}</Badge>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pending && (
        <ConfirmDialog
          title={pending.enabled ? "Disable this account?" : "Enable this account?"}
          body={`${pending.fullName} will ${pending.enabled ? "lose" : "regain"} access until you change this again.`}
          confirmLabel={pending.enabled ? "Disable" : "Enable"}
          danger={pending.enabled}
          onClose={() => setPending(null)}
          onConfirm={() => toggle.mutate(pending)}
        />
      )}
    </div>
  );
}
