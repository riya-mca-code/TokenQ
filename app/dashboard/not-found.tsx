import { EmptyState } from "@/components/layout/empty-state";

export default function DashboardNotFound() {
  return (
    <EmptyState
      title="Page not available"
      description="The dashboard page you requested is missing or not accessible with your current role."
      actionLabel="Back to dashboard"
      actionHref="/dashboard"
    />
  );
}
