import crypto from "crypto";
import { Queue } from "../models/Queue";
import { normalizeText } from "../utils/http";
import { slugify } from "../utils/slug";
import { writeAuditLog } from "../utils/audit";

export type QueueStatus = "ACTIVE" | "PAUSED" | "CLOSED";

function serializeQueue(queue: any) {
  return {
    id: String(queue._id),
    organizationId: String(queue.organizationId),
    name: queue.name,
    slug: queue.slug,
    status: queue.status,
    createdAt: queue.createdAt,
    updatedAt: queue.updatedAt,
  };
}

async function uniqueQueueSlug(organizationId: string, base: string, queueId?: string) {
  const normalizedBase = slugify(base) || "queue";

  for (let index = 0; index < 1000; index += 1) {
    const candidate = index === 0 ? normalizedBase : `${normalizedBase}-${index + 1}`;
    const existing = await Queue.findOne({
      organizationId,
      slug: candidate,
      deletedAt: null,
      ...(queueId ? { _id: { $ne: queueId } } : {}),
    }).lean();

    if (!existing) return candidate;
  }

  return `${normalizedBase}-${crypto.randomBytes(3).toString("hex")}`;
}

export async function listQueues(organizationId: string) {
  const queues = await Queue.find({ organizationId, deletedAt: null }).sort({ createdAt: -1 }).lean();
  return queues.map(serializeQueue);
}

export async function createQueue(input: {
  organizationId: string;
  name: string;
  status?: QueueStatus;
  userId?: string;
  ip?: string;
  userAgent?: string;
}) {
  const name = normalizeText(input.name);
  const slug = await uniqueQueueSlug(input.organizationId, name);

  const queue = await Queue.create({
    organizationId: input.organizationId,
    name,
    slug,
    status: input.status || "ACTIVE",
    deletedAt: null,
  });

  await writeAuditLog({
    organizationId: input.organizationId,
    userId: input.userId || null,
    action: "queue.created",
    entity: "queue",
    entityId: String(queue._id),
    ip: input.ip,
    userAgent: input.userAgent,
    meta: { name, status: queue.status },
  });

  return serializeQueue(queue);
}

export async function updateQueue(input: {
  organizationId: string;
  queueId: string;
  name?: string;
  status?: QueueStatus;
  userId?: string;
  ip?: string;
  userAgent?: string;
}) {
  const queue = await Queue.findOne({
    _id: input.queueId,
    organizationId: input.organizationId,
    deletedAt: null,
  });

  if (!queue) {
    throw Object.assign(new Error("Queue not found"), { status: 404 });
  }

  const nextName = input.name !== undefined ? normalizeText(input.name) : queue.name;
  const nextStatus = input.status || queue.status;

  queue.name = nextName;
  queue.slug = await uniqueQueueSlug(input.organizationId, nextName, String(queue._id));
  queue.status = nextStatus;

  await queue.save();

  await writeAuditLog({
    organizationId: input.organizationId,
    userId: input.userId || null,
    action: "queue.updated",
    entity: "queue",
    entityId: String(queue._id),
    ip: input.ip,
    userAgent: input.userAgent,
    meta: { name: queue.name, status: queue.status },
  });

  return serializeQueue(queue);
}

export async function deleteQueue(input: {
  organizationId: string;
  queueId: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
}) {
  const queue = await Queue.findOne({
    _id: input.queueId,
    organizationId: input.organizationId,
    deletedAt: null,
  });

  if (!queue) {
    throw Object.assign(new Error("Queue not found"), { status: 404 });
  }

  queue.deletedAt = new Date();
  await queue.save();

  await writeAuditLog({
    organizationId: input.organizationId,
    userId: input.userId || null,
    action: "queue.deleted",
    entity: "queue",
    entityId: String(queue._id),
    ip: input.ip,
    userAgent: input.userAgent,
    meta: { name: queue.name, status: queue.status },
  });

  return serializeQueue(queue);
}
