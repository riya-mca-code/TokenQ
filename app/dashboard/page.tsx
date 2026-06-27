import { redirect } from "next/navigation";
import { getSessionToken } from "@/lib/session";
import { backendFetch } from "@/lib/backend";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/layout/stat-card";
import { EmptyState } from "@/components/layout/empty-state";

async function getDashboardData() {
  const token = getSessionToken();
  if (!token) {
    redirect("/login");
  }

  const response = await backendFetch("/api/v1/organizations/dashboard/overview", {}, token);
  const payload = await response.json();

  if (!response.ok) {
    redirect("/login");
  }

  return payload.data as {
    user: { name: string; email: string; role: string; status: string };
    organization: {
      name: string;
      slug: string;
      businessType: string;
      status: string;
      plan: string;
      timezone: string;
      defaultWorkspace: { name: string; slug: string };
      branding: { displayName?: string; primaryColor?: string };
    } | null;
    metrics: { staffCount: number; activeUsers: number; status: string };
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Private workspace"
        title={data.organization ? data.organization.name : "Platform access"}
        description="Protected organization dashboard with isolated data and role-aware access."
        badge={data.user.role}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Staff members" value={data.metrics.staffCount} helper="Users scoped to this organization." />
        <StatCard label="Active users" value={data.metrics.activeUsers} helper="Active accounts with access enabled." />
        <StatCard label="Workspace" value={data.organization?.defaultWorkspace.name || "Platform"} helper="Default workspace created on registration." />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Organization details</CardTitle>
            <CardDescription>Branded and isolated settings for the current tenant.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.organization ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Slug</p>
                    <p className="mt-2 font-medium text-slate-900">{data.organization.slug}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Business type</p>
                    <p className="mt-2 font-medium text-slate-900">{data.organization.businessType}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Timezone</p>
                    <p className="mt-2 font-medium text-slate-900">{data.organization.timezone}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Plan</p>
                    <p className="mt-2 font-medium text-slate-900">{data.organization.plan}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="primary">{data.organization.status}</Badge>
                  <Badge>{data.organization.defaultWorkspace.name}</Badge>
                </div>
              </>
            ) : (
              <EmptyState
                title="Platform access only"
                description="Super admins can use this shell to navigate platform-level tools."
                actionLabel="Back to home"
                actionHref="/"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Signed in user</CardTitle>
            <CardDescription>Authentication is verified before this page renders.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-border bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Name</p>
              <p className="mt-1 font-medium text-slate-900">{data.user.name}</p>
            </div>
            <div className="rounded-2xl border border-border bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Email</p>
              <p className="mt-1 font-medium text-slate-900">{data.user.email}</p>
            </div>
            <div className="rounded-2xl border border-border bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Role</p>
              <p className="mt-1 font-medium text-slate-900">{data.user.role}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
