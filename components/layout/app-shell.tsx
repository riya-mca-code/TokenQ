"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, LayoutDashboard, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "./brand-mark";
import { dashboardNavItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isLoggingOut, startLogoutTransition] = React.useTransition();
  const router = useRouter();

  async function handleLogout() {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (response.ok) {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl">
        <aside className="hidden w-72 shrink-0 border-r border-border bg-white px-5 py-6 lg:flex lg:flex-col">
          <BrandMark />
          <nav className="mt-10 space-y-1">
            {dashboardNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                {item.label === "Overview" ? <LayoutDashboard className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-auto rounded-2xl border border-border bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-900">Private workspace</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Organization-aware access with protected routes.</p>
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3 lg:hidden">
                <Button variant="ghost" size="icon" aria-label="Open navigation" onClick={() => setMobileOpen(true)}>
                  <Menu className="h-5 w-5" />
                </Button>
                <BrandMark />
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-slate-900">Dashboard</p>
                <p className="text-xs text-slate-500">Organization isolated workspace</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  startLogoutTransition(() => {
                    void handleLogout();
                  });
                }}
                disabled={isLoggingOut}
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>
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
          "fixed inset-y-0 left-0 z-50 w-[18rem] max-w-[85vw] transform bg-white px-5 py-6 shadow-2xl transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between">
          <BrandMark />
          <Button variant="ghost" size="sm" onClick={() => setMobileOpen(false)}>
            Close
          </Button>
        </div>
        <nav className="mt-8 space-y-1">
          {dashboardNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label === "Overview" ? <LayoutDashboard className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
