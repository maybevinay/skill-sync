import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

const links: Array<{ label: string; href: string }> = [
  { label: "Dashboard", href: "/app" },
  { label: "Profile", href: "/app/profile" },
  { label: "Skills", href: "/app/skills" },
  { label: "Mentors", href: "/app/mentors" },
  { label: "Matches", href: "/app/matches" },
  { label: "Requests", href: "/app/requests" },
  { label: "Reviews", href: "/app/reviews" },
  { label: "AI Assistant", href: "/app/ai" },
  { label: "RAG Assistant", href: "/app/rag" },
  { label: "Settings", href: "/app/settings" },
];

function initials(name?: string) {
  if (!name) return "SS";
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function AppShell() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();

  async function onLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div className="bg-mesh grid min-h-screen overflow-x-hidden md:grid-cols-[15.5rem_minmax(0,1fr)]">
      <aside className="glass sticky top-0 hidden h-screen flex-col gap-5 border-r border-line p-4 md:flex">
        <div className="px-2 text-lg font-semibold tracking-tight">
          Skill<span className="text-accent">Sync</span>
        </div>
        <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto text-sm">
          {links.map(({ label, href }) => (
            <NavLink
              key={href}
              to={href}
              end={href === "/app"}
              className={({ isActive }) => cn("ss-nav", isActive && "ss-nav-active")}
            >
              {label}
            </NavLink>
          ))}
          {user?.role === "ADMIN" && (
            <NavLink to="/admin" className={({ isActive }) => cn("ss-nav mt-2 text-warning", isActive && "ss-nav-active")}>
              Admin
            </NavLink>
          )}
        </nav>
        <div className="space-y-3 border-t border-line pt-3">
          <div className="flex items-center gap-3 px-1">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
              {initials(user?.fullName)}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{user?.fullName}</div>
              <div className="truncate text-xs text-muted">{user?.role}</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={toggle}>
            Theme: {theme}
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => void onLogout()}>
            Logout
          </Button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 md:hidden">
          <span className="font-semibold">SkillSync</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggle}>
              {theme}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => void onLogout()}>
              Logout
            </Button>
          </div>
        </header>
        <nav className="-mx-0 flex gap-2 overflow-x-auto border-b border-line px-3 py-2 text-xs md:hidden">
          {links.map(({ label, href }) => (
            <NavLink
              key={href}
              to={href}
              end={href === "/app"}
              className={({ isActive }) =>
                cn(
                  "whitespace-nowrap rounded-full border border-line px-3 py-1.5 font-medium text-muted",
                  isActive && "border-primary/40 bg-primary/15 text-foreground",
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <main className="mx-auto w-full max-w-app min-w-0 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
