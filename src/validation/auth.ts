import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[0-9]/, "Password must include a number")
  .regex(/[^A-Za-z0-9]/, "Password must include a special character");

export const registerSchema = z.object({
  body: z.object({
    businessName: z.string().min(2),
    businessType: z.string().min(2),
    ownerName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(6),
    password: passwordSchema,
    timezone: z.string().optional(),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
    organizationSlug: z.string().optional(),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
    organizationSlug: z.string().optional(),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(16),
    password: passwordSchema,
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});
