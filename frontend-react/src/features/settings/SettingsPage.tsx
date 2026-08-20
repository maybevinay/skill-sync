import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/shared/PageHeader";

export function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  return (
    <div className="max-w-xl space-y-4">
      <PageHeader title="Settings" subtitle="Account, role, and appearance" />
      <Card className="space-y-3 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-muted">Email</span>
          <span className="font-medium">{user?.email}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted">Role</span>
          <Badge tone="primary">{user?.role ?? "USER"}</Badge>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted">Verified</span>
          <Badge tone={user?.emailVerified ? "success" : "warning"}>{user?.emailVerified ? "Yes" : "Pending"}</Badge>
        </div>
        <p className="text-muted">JWT access tokens expire in 15 minutes and refresh automatically.</p>
        <Button variant="outline" onClick={toggle}>
          Switch to {theme === "dark" ? "light" : "dark"} mode
        </Button>
      </Card>
    </div>
  );
}
