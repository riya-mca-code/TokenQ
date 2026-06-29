"use client";

import * as React from "react";
import { AlertCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { StatCard } from "@/components/layout/stat-card";
import { EmptyState } from "@/components/layout/empty-state";
import type { DashboardRole } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export type QueueItem = {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  status: "ACTIVE" | "PAUSED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
};

type QueueManagerProps = {
  initialQueues: QueueItem[];
  role: DashboardRole;
};

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "PAUSED", label: "Paused" },
  { value: "CLOSED", label: "Closed" },
] as const;

function statusLabel(status: QueueItem["status"]) {
  return statusOptions.find((item) => item.value === status)?.label || status;
}

function statusVariant(status: QueueItem["status"]) {
  if (status === "ACTIVE") return "success";
  if (status === "PAUSED") return "warning";
  return "destructive";
}

function canManage(role: DashboardRole) {
  return role === "OWNER" || role === "ADMIN";
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function QueueManager({ initialQueues, role }: QueueManagerProps) {
  const [queues, setQueues] = React.useState(initialQueues);
  const [editingQueueId, setEditingQueueId] = React.useState<string | null>(null);
  const [name, setName] = React.useState("");
  const [status, setStatus] = React.useState<QueueItem["status"]>("ACTIVE");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const canWrite = canManage(role);
  const editingQueue = queues.find((queue) => queue.id === editingQueueId) || null;

  React.useEffect(() => {
    if (editingQueue) {
      setName(editingQueue.name);
      setStatus(editingQueue.status);
    } else {
      setName("");
      setStatus("ACTIVE");
    }
  }, [editingQueue]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canWrite) return;

    setError("");
    setSuccess("");
    setIsSaving(true);

    const response = await fetch(editingQueueId ? `/api/queues/${editingQueueId}` : "/api/queues", {
      method: editingQueueId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        status,
      }),
    });
    const payload = await response.json();

    setIsSaving(false);

    if (!response.ok) {
      setError(payload?.message || "Unable to save queue");
      return;
    }

    const nextQueue: QueueItem = payload.data.queue;
    setQueues((current) => {
      const filtered = current.filter((queue) => queue.id !== nextQueue.id);
      return [nextQueue, ...filtered].sort((left, right) => {
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      });
    });
    setEditingQueueId(null);
    setName("");
    setStatus("ACTIVE");
    setSuccess(editingQueueId ? "Queue updated successfully" : "Queue created successfully");
  }

  async function handleDelete(queue: QueueItem) {
    if (!canWrite) return;
    if (!window.confirm(`Delete queue "${queue.name}"?`)) return;

    setDeletingId(queue.id);
    setError("");
    setSuccess("");

    const response = await fetch(`/api/queues/${queue.id}`, {
      method: "DELETE",
    });
    const payload = await response.json();
    setDeletingId(null);

    if (!response.ok) {
      setError(payload?.message || "Unable to delete queue");
      return;
    }

    setQueues((current) => current.filter((item) => item.id !== queue.id));
    if (editingQueueId === queue.id) {
      setEditingQueueId(null);
    }
    setSuccess("Queue deleted successfully");
  }

  const totalQueues = queues.length;
  const activeQueues = queues.filter((queue) => queue.status === "ACTIVE").length;
  const pausedQueues = queues.filter((queue) => queue.status === "PAUSED").length;
  const closedQueues = queues.filter((queue) => queue.status === "CLOSED").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total queues" value={totalQueues} helper="All active records in this organization." />
        <StatCard label="Active" value={activeQueues} helper="Currently available to staff and customers." />
        <StatCard label="Paused" value={pausedQueues} helper="Temporarily unavailable queues." />
        <StatCard label="Closed" value={closedQueues} helper="Completed or archived queue entries." />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{editingQueue ? "Edit queue" : "Create queue"}</CardTitle>
            <CardDescription>
              {canWrite
                ? "Manage queue names and their operational status."
                : "You can view queues, but only owners and admins can make changes."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {canWrite ? (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="queueName">Queue name</Label>
                  <Input
                    id="queueName"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Reception Queue"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="queueStatus">Status</Label>
                  <select
                    id="queueStatus"
                    value={status}
                    onChange={(event) => setStatus(event.target.value as QueueItem["status"])}
                    className="flex h-11 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-offset-white transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {error ? (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                ) : null}

                {success ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={isSaving}>
                    {isSaving ? "Saving..." : editingQueue ? "Update queue" : "Create queue"}
                    {!isSaving && !editingQueue ? <Plus className="ml-2 h-4 w-4" /> : null}
                  </Button>
                  {editingQueue ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingQueueId(null);
                        setName("");
                        setStatus("ACTIVE");
                      }}
                    >
                      Cancel
                    </Button>
                  ) : null}
                </div>
              </form>
            ) : (
              <EmptyState
                title="Read-only access"
                description="Your role can view queue status, but only owners and admins can create, edit, or delete queues."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Queue list</CardTitle>
            <CardDescription>Organization-scoped queue records with direct CRUD actions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {queues.length > 0 ? (
              queues.map((queue) => {
                const isDeleting = deletingId === queue.id;
                const isEditing = editingQueueId === queue.id;

                return (
                  <div key={queue.id} className={cn("rounded-2xl border border-border bg-slate-50 p-4", isEditing && "bg-blue-50")}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold text-slate-900">{queue.name}</p>
                          <Badge variant={statusVariant(queue.status)}>{statusLabel(queue.status)}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">/{queue.slug}</p>
                        <p className="mt-2 text-xs text-slate-500">Updated {formatDate(queue.updatedAt)}</p>
                      </div>

                      {canWrite ? (
                        <div className="flex shrink-0 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => {
                              setEditingQueueId(queue.id);
                              setError("");
                              setSuccess("");
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="gap-2"
                            onClick={() => void handleDelete(queue)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4" />
                            {isDeleting ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                      ) : null}
                    </div>

                    {isEditing ? <Separator className="my-4" /> : null}
                    {isEditing ? <p className="text-xs text-blue-700">Editing this queue.</p> : null}
                  </div>
                );
              })
            ) : (
              <EmptyState
                title="No queues yet"
                description="Create the first queue to start organizing customer flow."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
