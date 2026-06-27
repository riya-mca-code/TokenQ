import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { AppShell } from "@/components/layout/app-shell";

export default function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    redirect("/login");
  }

  return <AppShell>{children}</AppShell>;
}
