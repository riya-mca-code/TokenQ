import { z } from "zod";

const queueStatusSchema = z.enum(["ACTIVE", "PAUSED", "CLOSED"]);

export const queueIdParamSchema = z.object({
  body: z.any().optional(),
  query: z.any().optional(),
  params: z.object({
    queueId: z.string().min(1),
  }),
});

export const createQueueSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Queue name is required"),
    status: queueStatusSchema.optional(),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});

export const updateQueueSchema = z
  .object({
    body: z
      .object({
        name: z.string().min(2, "Queue name is required").optional(),
        status: queueStatusSchema.optional(),
      })
      .refine((value) => value.name !== undefined || value.status !== undefined, {
        message: "At least one field is required",
      }),
    query: z.any().optional(),
    params: z.any().optional(),
  });
