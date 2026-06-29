import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { AppShell } from "@/components/layout/app-shell";
import { backendFetch } from "@/lib/backend";
import type { DashboardSession } from "@/components/layout/app-shell";

export default async function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    redirect("/login");
  }

  const response = await backendFetch("/api/v1/auth/me", {}, token);

  if (!response.ok) {
    redirect("/login");
  }

  const payload = await response.json();

  return <AppShell session={payload.data as DashboardSession}>{children}</AppShell>;
}
