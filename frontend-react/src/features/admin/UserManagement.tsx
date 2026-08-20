import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { PageHeader } from "@/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type User = { id: number; fullName: string; email: string; role: string; enabled: boolean };

export function UserManagement() {
  const qc = useQueryClient();
  const users = useQuery({ queryKey: ["admin-users"], queryFn: async () => (await api.get("/api/admin/users")).data as User[] });
  const toggle = useMutation({
    mutationFn: async (u: User) => api.patch(`/api/admin/users/${u.id}/enabled`, null, { params: { enabled: !u.enabled } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
  const role = useMutation({
    mutationFn: async ({ id, role }: { id: number; role: string }) => api.patch(`/api/admin/users/${id}/role`, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
  return (
    <div>
      <PageHeader title="User management" subtitle="Roles and account status" />
      <Card className="overflow-x-auto p-0">
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
            {users.data?.map((u) => (
              <tr key={u.id}>
                <td className="font-medium">{u.fullName}</td>
                <td className="text-muted">{u.email}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => role.mutate({ id: u.id, role: e.target.value })}
                    className="ss-field min-h-0 py-1.5"
                  >
                    <option>USER</option>
                    <option>MENTOR</option>
                    <option>ADMIN</option>
                  </select>
                </td>
                <td>
                  <Button variant="outline" size="sm" onClick={() => toggle.mutate(u)}>
                    <Badge tone={u.enabled ? "success" : "danger"}>{u.enabled ? "Enabled" : "Disabled"}</Badge>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
