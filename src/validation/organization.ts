import { z } from "zod";

export const organizationIdParamSchema = z.object({
  body: z.any().optional(),
  query: z.any().optional(),
  params: z.object({
    organizationId: z.string().min(1),
  }),
});
