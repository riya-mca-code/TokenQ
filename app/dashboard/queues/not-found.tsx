import { EmptyState } from "@/components/layout/empty-state";

export default function QueuesNotFound() {
  return (
    <EmptyState
      title="Queues not available"
      description="The requested queue page is unavailable for this workspace or role."
      actionLabel="Back to dashboard"
      actionHref="/dashboard"
    />
  );
}
