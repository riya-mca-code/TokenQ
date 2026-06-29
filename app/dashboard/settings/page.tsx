import { notFound, redirect } from "next/navigation";
import { getSessionToken } from "@/lib/session";
import { backendFetch } from "@/lib/backend";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";

async function getSettingsData() {
  const token = await getSessionToken();
  if (!token) redirect("/login");

  const response = await backendFetch("/api/v1/organizations/dashboard/overview", {}, token);
  const payload = await response.json();
  if (!response.ok) redirect("/login");

  return payload.data as {
    user: { role: string };
    organization: {
      name: string;
      slug: string;
      businessType: string;
      ownerName: string;
      email: string;
      phone: string;
      timezone: string;
      branding: { displayName?: string; primaryColor?: string; accentColor?: string };
      defaultWorkspace: { name: string; slug: string };
    } | null;
  };
}

export default async function SettingsPage() {
  const data = await getSettingsData();

  if (!data.organization || (data.user.role !== "OWNER" && data.user.role !== "ADMIN")) {
    notFound();
  }

  const organization = data.organization;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Organization settings"
        title="Branding and workspace"
        description="The current organization configuration used by the dashboard."
      />
      <Card>
        <CardHeader>
          <CardTitle>Workspace profile</CardTitle>
          <CardDescription>Safe defaults created at registration time.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Display name</p>
            <p className="mt-1 font-medium text-slate-900">{organization.branding.displayName || organization.name}</p>
          </div>
          <div className="rounded-2xl border border-border bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Workspace</p>
            <p className="mt-1 font-medium text-slate-900">{organization.defaultWorkspace.name}</p>
          </div>
          <div className="rounded-2xl border border-border bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Slug</p>
            <p className="mt-1 font-medium text-slate-900">{organization.slug}</p>
          </div>
          <div className="rounded-2xl border border-border bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Timezone</p>
            <p className="mt-1 font-medium text-slate-900">{organization.timezone}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
