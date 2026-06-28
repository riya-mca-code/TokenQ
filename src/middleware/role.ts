import type { NextFunction, Request, Response } from "express";
import { sendError } from "../utils/response";

export function allowRoles(...roles: Array<"SUPER_ADMIN" | "OWNER" | "ADMIN" | "STAFF">) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) return sendError(res, 401, "Authentication required");
    if (!roles.includes(req.auth.role)) return sendError(res, 403, "Access denied");
    return next();
  };
}
