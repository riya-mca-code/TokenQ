import type { NextFunction, Request, Response } from "express";
import { sendError } from "../utils/response";

export function resolveOrganization(req: Request, res: Response, next: NextFunction) {
  if (!req.auth) return sendError(res, 401, "Authentication required");
  if (req.auth.role === "SUPER_ADMIN") {
    const explicitOrganizationId =
      (typeof req.params.organizationId === "string" && req.params.organizationId) ||
      (typeof req.query.organizationId === "string" && req.query.organizationId) ||
      (typeof req.body?.organizationId === "string" && req.body.organizationId) ||
      "";
    req.organizationId = explicitOrganizationId || null;
    return next();
  }

  if (!req.auth.organizationId) return sendError(res, 403, "Organization context required");
  req.organizationId = req.auth.organizationId;
  return next();
}
