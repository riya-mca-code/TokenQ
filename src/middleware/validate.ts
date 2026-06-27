import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { sendError } from "../utils/response";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      return sendError(res, 422, result.error.issues[0]?.message || "Validation error");
    }

    req.body = result.data.body;
    req.query = result.data.query;
    req.params = result.data.params;
    return next();
  };
}
