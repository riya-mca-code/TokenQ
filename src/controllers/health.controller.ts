import type { Request, Response } from "express";
import { sendSuccess } from "../utils/response";

export function getHealth(req: Request, res: Response) {
  return sendSuccess(res, "Service is healthy", {
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
