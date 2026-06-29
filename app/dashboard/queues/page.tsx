import { notFound, redirect } from "next/navigation";
import { backendFetch } from "@/lib/backend";
import { getSessionToken } from "@/lib/session";
import { PageHeader } from "@/components/layout/page-header";
import { QueueManager, type QueueItem } from "@/components/queues/queue-manager";
import type { DashboardSession } from "@/components/layout/app-shell";

async function getQueueData() {
  const token = await getSessionToken();
  if (!token) redirect("/login");

  const [meResponse, queuesResponse] = await Promise.all([
    backendFetch("/api/v1/auth/me", {}, token),
    backendFetch("/api/v1/queues", {}, token),
  ]);

  if (!meResponse.ok) redirect("/login");
  if (!queuesResponse.ok) {
    if (queuesResponse.status === 404) notFound();
    redirect("/login");
  }

  const [mePayload, queuesPayload] = await Promise.all([meResponse.json(), queuesResponse.json()]);

  return {
    session: mePayload.data as DashboardSession,
    queues: (queuesPayload.data.queues || []) as QueueItem[],
  };
}

export default async function QueuesPage() {
  const { session, queues } = await getQueueData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Queue management"
        title="Queues"
        description="Create, edit, and retire organization-scoped queues with role-based access."
        badge={session.user.role}
      />
      <QueueManager initialQueues={queues} role={session.user.role} />
    </div>
  );
}
