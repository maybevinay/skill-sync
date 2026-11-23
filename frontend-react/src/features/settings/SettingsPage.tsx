import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { matchingApi } from "@/services/matching.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/shared/PageHeader";
import { Avatar } from "@/lib/ui";

export function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const profile = useQuery({ queryKey: ["profile"], queryFn: matchingApi.profile, retry: false });
  return (
    <div className="max-w-xl space-y-8">
      <PageHeader title="Settings" subtitle="Account, role, and appearance." />
      <section className="flex items-center gap-4">
        <Avatar name={user?.fullName} src={profile.data?.photoUrl} className="h-14 w-14 text-sm" />
        <div>
          <div className="font-semibold">{user?.fullName}</div>
          <div className="text-sm text-muted">{user?.email}</div>
        </div>
      </section>
      <dl className="space-y-4 text-sm">
        <div className="flex justify-between gap-3 border-b border-line pb-4">
          <dt className="text-muted">Role</dt>
          <dd>
            <Badge tone="primary">{user?.role ?? "USER"}</Badge>
          </dd>
        </div>
        <div className="flex justify-between gap-3 border-b border-line pb-4">
          <dt className="text-muted">Verified</dt>
          <dd>
            <Badge tone={user?.emailVerified ? "success" : "warning"}>{user?.emailVerified ? "Yes" : "Pending"}</Badge>
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Appearance</dt>
          <dd>
            <Button variant="outline" size="sm" onClick={toggle}>
              Switch to {theme === "dark" ? "light" : "dark"}
            </Button>
          </dd>
        </div>
      </dl>
      <p className="text-sm text-muted">JWT access tokens expire in 15 minutes and refresh automatically.</p>
    </div>
  );
}
