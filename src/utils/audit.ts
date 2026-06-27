import { AuditLog } from "../models/AuditLog";

export async function writeAuditLog(params: {
  organizationId?: string | null;
  userId?: string | null;
  action: string;
  entity?: string;
  entityId?: string;
  ip?: string;
  userAgent?: string;
  meta?: Record<string, unknown>;
}) {
  await AuditLog.create({
    organizationId: params.organizationId || null,
    userId: params.userId || null,
    action: params.action,
    entity: params.entity || "",
    entityId: params.entityId || "",
    ip: params.ip || "",
    userAgent: params.userAgent || "",
    meta: params.meta || {},
  });
}
