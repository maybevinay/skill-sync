import { FormEvent, useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Bell,
  BookOpen,
  Bot,
  FileSearch,
  GitCompare,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sparkles,
  Star,
  Sun,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { matchingApi } from "@/services/matching.service";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Avatar } from "@/lib/ui";

const links: Array<{ label: string; href: string; icon: typeof LayoutDashboard }> = [
  { label: "Dashboard", href: "/app", icon: LayoutDashboard },
  { label: "Mentors", href: "/app/mentors", icon: Users },
  { label: "Matches", href: "/app/matches", icon: GitCompare },
  { label: "Requests", href: "/app/requests", icon: Inbox },
  { label: "Skills", href: "/app/skills", icon: BookOpen },
  { label: "AI Assistant", href: "/app/ai", icon: Bot },
  { label: "RAG Assistant", href: "/app/rag", icon: FileSearch },
  { label: "Profile", href: "/app/profile", icon: UserRound },
  { label: "Reviews", href: "/app/reviews", icon: Star },
  { label: "Settings", href: "/app/settings", icon: Settings },
];

const titles: Record<string, { title: string; subtitle: string }> = {
  "/app/rag": {
    title: "RAG Assistant",
    subtitle: "Upload documents, search knowledge and get AI-powered answers with sources.",
  },
};

export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [q, setQ] = useState("");
  const rag = location.pathname === "/app/rag";
  const meta = titles[location.pathname];

  const requests = useQuery({ queryKey: ["requests"], queryFn: matchingApi.requests, retry: false });
  const pending = (requests.data ?? []).filter((r: { status: string }) => r.status === "PENDING").length;

  useEffect(() => {
    setMenuOpen(false);
    if (location.pathname === "/app/mentors") setQ(params.get("skill") ?? "");
  }, [location.pathname, params]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function onLogout() {
    await logout();
    navigate("/login");
  }

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const skill = q.trim();
    navigate(skill ? `/app/mentors?skill=${encodeURIComponent(skill)}` : "/app/mentors");
  }

  const nav = (
    <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto pr-1" aria-label="Main">
      {links.map(({ label, href, icon: Icon }) => (
        <NavLink
          key={href}
          to={href}
          end={href === "/app"}
          title={label}
          className={({ isActive }) => cn("ss-nav", isActive && "ss-nav-active")}
        >
          <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          {label}
        </NavLink>
      ))}
      {user?.role === "ADMIN" && (
        <NavLink to="/admin" className={({ isActive }) => cn("ss-nav mt-2", isActive && "ss-nav-active")}>
          <Settings className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          Admin
        </NavLink>
      )}
    </nav>
  );

  return (
    <div className="grid min-h-screen overflow-x-hidden bg-background md:grid-cols-[16.5rem_minmax(0,1fr)]">
      {menuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm md:hidden"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[16.5rem] flex-col gap-5 border-r border-line bg-surface p-4 transition-transform duration-200 ease-out md:sticky md:top-0 md:h-screen md:translate-x-0",
          menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between px-1">
          <Logo to="/app" />
          <button type="button" className="rounded-lg p-1 text-muted md:hidden" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        {nav}
        <div className="rounded-ss border border-line bg-surface-2/70 p-3">
          <div className="flex items-center gap-3">
            <Avatar name={user?.fullName} className="h-10 w-10 text-xs" />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-foreground">{user?.fullName}</div>
              <div className="truncate text-[11px] font-medium uppercase tracking-wide text-muted-2">{user?.role}</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur-md md:px-8">
          <button
            type="button"
            className="rounded-lg p-1.5 text-muted hover:bg-lavender hover:text-primary md:hidden"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          {rag && meta ? (
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lavender text-primary">
                <Sparkles className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold tracking-tight md:text-lg">{meta.title}</h1>
                <p className="hidden truncate text-xs text-muted sm:block">{meta.subtitle}</p>
              </div>
            </div>
          ) : null}
          <form onSubmit={onSearch} className={cn("relative min-w-0 flex-1 max-w-md", rag && "hidden lg:block")}>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
            <input
              className="ss-field h-10 pl-9"
              placeholder="Search mentors by skill"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search mentors by skill"
            />
          </form>
          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-10 w-10 px-0" onClick={toggle} aria-label="Toggle theme">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="relative h-10 w-10 px-0"
              aria-label={pending ? `${pending} pending requests` : "Requests"}
              onClick={() => navigate("/app/requests")}
            >
              <Bell className="h-4 w-4" />
              {pending > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
              )}
            </Button>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl px-1.5 py-1 hover:bg-lavender"
                  aria-label="Account menu"
                >
                  <Avatar name={user?.fullName} className="h-9 w-9 text-xs" />
                  <div className="hidden text-left sm:block">
                    <div className="max-w-[9rem] truncate text-sm font-medium">{user?.fullName}</div>
                    <div className="text-[11px] font-medium uppercase tracking-wide text-muted-2">{user?.role}</div>
                  </div>
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={8}
                  className="z-50 w-52 rounded-ss border border-line bg-surface p-1 shadow-card"
                >
                  <DropdownMenu.Item
                    className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm outline-none hover:bg-lavender"
                    onSelect={() => navigate("/app/profile")}
                  >
                    <UserRound className="h-4 w-4" /> Profile
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm outline-none hover:bg-lavender"
                    onSelect={() => navigate("/app/settings")}
                  >
                    <Settings className="h-4 w-4" /> Settings
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="my-1 h-px bg-line" />
                  <DropdownMenu.Item
                    className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm outline-none hover:bg-rose hover:text-danger"
                    onSelect={() => void onLogout()}
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </header>
        <main className="ss-page mx-auto w-full min-w-0 max-w-app flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
