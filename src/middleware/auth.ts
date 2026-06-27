import type { NextFunction, Request, Response } from "express";
import { verifyAuthToken } from "../utils/jwt";
import { sendError } from "../utils/response";

function getTokenFromRequest(req: Request) {
  const header = req.header("authorization");
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return req.cookies?.tokenq_session || "";
}

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const token = getTokenFromRequest(req);
  if (!token) return sendError(res, 401, "Authentication required");

  try {
    req.auth = verifyAuthToken(token);
    if (req.auth.organizationId) {
      req.organizationId = req.auth.organizationId;
    }
    return next();
  } catch {
    return sendError(res, 401, "Authentication required");
  }
}
