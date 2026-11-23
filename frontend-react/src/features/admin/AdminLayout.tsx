import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  FileText,
  LayoutDashboard,
  Moon,
  Sun,
  UserCheck,
  Users,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Avatar } from "@/lib/ui";

const items = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Mentors", href: "/admin/mentors", icon: UserCheck },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Reports", href: "/admin/reports", icon: FileText },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toggle, theme } = useTheme();
  return (
    <div className="grid min-h-screen overflow-x-hidden bg-background md:grid-cols-[16.5rem_minmax(0,1fr)]">
      <aside className="hidden flex-col gap-5 border-r border-line bg-surface p-4 md:flex">
        <Logo to="/admin" />
        <nav className="flex min-h-0 flex-1 flex-col gap-0.5" aria-label="Admin">
          {items.map(({ label, href, icon: Icon }) => (
            <NavLink
              key={href}
              to={href}
              end={href === "/admin"}
              className={({ isActive }) => cn("ss-nav", isActive && "ss-nav-active")}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>
        <Button variant="ghost" className="justify-start" onClick={() => navigate("/app")}>
          <ArrowLeft className="h-4 w-4" /> Back to app
        </Button>
      </aside>
      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur-md md:px-8">
          <div className="font-semibold tracking-tight md:hidden">Admin</div>
          <nav className="flex gap-1 overflow-x-auto md:hidden" aria-label="Admin">
            {items.map(({ label, href }) => (
              <NavLink
                key={href}
                to={href}
                end={href === "/admin"}
                className={({ isActive }) =>
                  cn("whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted", isActive && "bg-lavender text-primary")
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-10 w-10 px-0" onClick={toggle} aria-label="Toggle theme">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Avatar name={user?.fullName} className="h-9 w-9 text-xs" />
          </div>
        </header>
        <main className="ss-page mx-auto w-full min-w-0 max-w-app flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
