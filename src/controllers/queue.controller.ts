import type { NextFunction, Request, Response } from "express";
import { sendError, sendSuccess } from "../utils/response";
import { createQueue, deleteQueue, listQueues, updateQueue } from "../services/queue.service";

export async function listQueuesController(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.organizationId) return sendError(res, 400, "Organization context required");
    const queues = await listQueues(req.organizationId);
    return sendSuccess(res, "Queues loaded", { queues });
  } catch (error) {
    return next(error);
  }
}

export async function createQueueController(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.organizationId || !req.auth) return sendError(res, 400, "Organization context required");
    const queue = await createQueue({
      organizationId: req.organizationId,
      name: req.body.name,
      status: req.body.status,
      userId: req.auth.id,
      ip: req.ip,
      userAgent: req.get("user-agent") || "",
    });
    return sendSuccess(res, "Queue created successfully", { queue }, 201);
  } catch (error) {
    return next(error);
  }
}

export async function updateQueueController(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.organizationId || !req.auth) return sendError(res, 400, "Organization context required");
    const queueId = typeof req.params.queueId === "string" ? req.params.queueId : "";
    const queue = await updateQueue({
      organizationId: req.organizationId,
      queueId,
      name: req.body.name,
      status: req.body.status,
      userId: req.auth.id,
      ip: req.ip,
      userAgent: req.get("user-agent") || "",
    });
    return sendSuccess(res, "Queue updated successfully", { queue });
  } catch (error) {
    return next(error);
  }
}

export async function deleteQueueController(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.organizationId || !req.auth) return sendError(res, 400, "Organization context required");
    const queueId = typeof req.params.queueId === "string" ? req.params.queueId : "";
    const queue = await deleteQueue({
      organizationId: req.organizationId,
      queueId,
      userId: req.auth.id,
      ip: req.ip,
      userAgent: req.get("user-agent") || "",
    });
    return sendSuccess(res, "Queue deleted successfully", { queue });
  } catch (error) {
    return next(error);
  }
}
