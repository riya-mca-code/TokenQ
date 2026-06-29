"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, ChevronDown, LayoutDashboard, ListTodo, LogOut, Menu, Settings, UserCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { BrandMark } from "./brand-mark";
import { getDashboardNavItems, type DashboardRole } from "@/lib/navigation";

export type DashboardSession = {
  user: {
    id: string;
    name: string;
    email: string;
    role: DashboardRole;
    status: string;
  };
  organization: {
    name: string;
    slug: string;
    email: string;
    status: string;
    plan: string;
    timezone: string;
    branding: {
      displayName?: string;
      primaryColor?: string;
    };
    defaultWorkspace: {
      name: string;
      slug: string;
    };
  } | null;
};

function roleLabel(role: DashboardRole) {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super Admin";
    case "OWNER":
      return "Owner";
    case "ADMIN":
      return "Admin";
    case "STAFF":
      return "Staff";
  }
}

function initials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function NavIcon({ label }: { label: string }) {
  if (label === "Overview") return <LayoutDashboard className="h-4 w-4" />;
  if (label === "Queues") return <ListTodo className="h-4 w-4" />;
  return <Settings className="h-4 w-4" />;
}

export function AppShell({ children, session }: { children: React.ReactNode; session: DashboardSession }) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = getDashboardNavItems(session.user.role);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const profileRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);
    const response = await fetch("/api/auth/logout", { method: "POST" });
    setIsLoggingOut(false);

    if (response.ok) {
      router.replace("/login");
      router.refresh();
    }
  }

  const organizationName = session.organization?.branding.displayName || session.organization?.name || "Platform access";
  const organizationSlug = session.organization?.slug || "platform";
  const organizationMeta = session.organization
    ? `${session.organization.defaultWorkspace.name} • ${session.organization.timezone}`
    : "Platform-wide access";
  const userBadge = initials(session.user.name || session.user.email);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl">
        <aside className="hidden w-72 shrink-0 border-r border-border bg-white/95 px-5 py-6 lg:flex lg:flex-col">
          <BrandMark />

          <div className="mt-8 rounded-2xl border border-border bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Workspace</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{organizationName}</p>
            <p className="mt-1 text-sm text-slate-600">{organizationSlug}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {session.organization ? <Badge variant="primary">{session.organization.status}</Badge> : <Badge>Platform</Badge>}
              <Badge>{roleLabel(session.user.role)}</Badge>
            </div>
          </div>

          <nav className="mt-8 space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                    active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <NavIcon label={item.label} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-border bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-900">Protected dashboard</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Session-backed access with organization-aware routing and role permissions.
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur">
            <div className="flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3 lg:hidden">
                <Button variant="ghost" size="icon" aria-label="Open navigation" onClick={() => setMobileOpen(true)}>
                  <Menu className="h-5 w-5" />
                </Button>
                <BrandMark />
              </div>

              <div className="hidden min-w-0 flex-1 lg:block">
                <div className="flex items-center gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{organizationName}</p>
                    <p className="truncate text-xs text-slate-500">{organizationMeta}</p>
                  </div>
                  {session.organization ? <Badge variant="primary">{session.organization.plan}</Badge> : <Badge>Platform</Badge>}
                </div>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <div className="hidden items-center gap-2 rounded-full border border-border bg-slate-50 px-3 py-1.5 text-xs text-slate-600 sm:flex">
                  <UserCircle2 className="h-4 w-4 text-slate-500" />
                  <span>{roleLabel(session.user.role)}</span>
                </div>

                <div className="relative" ref={profileRef}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-full bg-white px-3"
                    onClick={() => setProfileOpen((value) => !value)}
                    aria-haspopup="menu"
                    aria-expanded={profileOpen}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                      {userBadge}
                    </span>
                    <span className="hidden max-w-[9rem] truncate sm:inline">{session.user.name}</span>
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  </Button>

                  {profileOpen ? (
                    <div className="absolute right-0 z-40 mt-3 w-80 rounded-2xl border border-border bg-white p-4 shadow-2xl">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{session.user.name}</p>
                          <p className="truncate text-sm text-slate-500">{session.user.email}</p>
                        </div>
                        <Badge variant="primary">{roleLabel(session.user.role)}</Badge>
                      </div>

                      <Separator className="my-4" />

                      <div className="space-y-3">
                        <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                          <Building2 className="mt-0.5 h-4 w-4 text-slate-500" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">{organizationName}</p>
                            <p className="text-xs text-slate-500">{organizationMeta}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                          <span>Status</span>
                          <span className="font-medium text-slate-900">{session.user.status}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        {session.user.role !== "STAFF" ? (
                          <Button asChild variant="outline" className="flex-1">
                            <Link href="/dashboard/settings" onClick={() => setProfileOpen(false)}>
                              Settings
                            </Link>
                          </Button>
                        ) : null}
                        <Button className="flex-1 gap-2" onClick={handleLogout} disabled={isLoggingOut}>
                          <LogOut className="h-4 w-4" />
                          {isLoggingOut ? "Signing out..." : "Logout"}
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/40 transition-opacity lg:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden="true"
        onClick={() => setMobileOpen(false)}
      />

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[18rem] max-w-[85vw] bg-white px-5 py-6 shadow-2xl transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between">
          <BrandMark />
          <Button variant="ghost" size="sm" onClick={() => setMobileOpen(false)}>
            Close
          </Button>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Workspace</p>
          <p className="mt-2 text-base font-semibold text-slate-900">{organizationName}</p>
          <p className="mt-1 text-sm text-slate-600">{organizationSlug}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {session.organization ? <Badge variant="primary">{session.organization.status}</Badge> : <Badge>Platform</Badge>}
            <Badge>{roleLabel(session.user.role)}</Badge>
          </div>
        </div>

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                  active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <NavIcon label={item.label} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 rounded-2xl border border-border bg-white p-4">
          <p className="text-sm font-medium text-slate-900">{session.user.name}</p>
          <p className="mt-1 text-xs text-slate-500">{session.user.email}</p>
          <div className="mt-4 flex gap-2">
            {session.user.role !== "STAFF" ? (
              <Button asChild variant="outline" className="flex-1">
                <Link href="/dashboard/settings" onClick={() => setMobileOpen(false)}>
                  Settings
                </Link>
              </Button>
            ) : null}
            <Button className="flex-1 gap-2" onClick={handleLogout} disabled={isLoggingOut}>
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? "Signing out..." : "Logout"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
