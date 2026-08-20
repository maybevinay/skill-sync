import { NavLink, Outlet } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

const items: Array<{ label: string; href: string }> = [
  { label: "Overview", href: "/admin" },
  { label: "Users", href: "/admin/users" },
  { label: "Mentors", href: "/admin/mentors" },
  { label: "Analytics", href: "/admin/analytics" },
  { label: "Reports", href: "/admin/reports" },
];

export function AdminLayout() {
  const { toggle, theme } = useTheme();
  return (
    <div className="bg-mesh min-h-screen overflow-x-hidden">
      <header className="flex items-center justify-between gap-4 border-b border-line px-4 py-3 md:px-6">
        <div className="font-semibold tracking-tight">SkillSync Admin</div>
        <div className="flex items-center gap-2 text-sm">
          <Button variant="ghost" size="sm" onClick={toggle}>
            {theme}
          </Button>
          <NavLink to="/app" className="rounded-ss px-3 py-2 text-sm font-medium text-muted hover:text-foreground">
            Back to app
          </NavLink>
        </div>
      </header>
      <nav className="flex gap-2 overflow-x-auto border-b border-line px-3 py-2 md:hidden">
        {items.map(({ label, href }) => (
          <NavLink
            key={href}
            to={href}
            end={href === "/admin"}
            className={({ isActive }) =>
              cn(
                "whitespace-nowrap rounded-full border border-line px-3 py-1.5 text-xs font-medium text-muted",
                isActive && "border-primary/40 bg-primary/15 text-foreground",
              )
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="flex min-w-0">
        <nav className="hidden w-52 shrink-0 space-y-0.5 border-r border-line p-4 md:block">
          {items.map(({ label, href }) => (
            <NavLink
              key={href}
              to={href}
              end={href === "/admin"}
              className={({ isActive }) => cn("ss-nav", isActive && "ss-nav-active")}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <main className="mx-auto min-w-0 w-full max-w-app flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
