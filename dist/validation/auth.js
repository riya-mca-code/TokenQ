"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const passwordSchema = zod_1.z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must include a lowercase letter")
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/[0-9]/, "Password must include a number")
    .regex(/[^A-Za-z0-9]/, "Password must include a special character");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        businessName: zod_1.z.string().min(2),
        businessType: zod_1.z.string().min(2),
        ownerName: zod_1.z.string().min(2),
        email: zod_1.z.string().email(),
        phone: zod_1.z.string().min(6),
        password: passwordSchema,
        timezone: zod_1.z.string().optional(),
    }),
    query: zod_1.z.any().optional(),
    params: zod_1.z.any().optional(),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(1),
        organizationSlug: zod_1.z.string().optional(),
    }),
    query: zod_1.z.any().optional(),
    params: zod_1.z.any().optional(),
});
exports.forgotPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        organizationSlug: zod_1.z.string().optional(),
    }),
    query: zod_1.z.any().optional(),
    params: zod_1.z.any().optional(),
});
exports.resetPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        token: zod_1.z.string().min(16),
        password: passwordSchema,
    }),
    query: zod_1.z.any().optional(),
    params: zod_1.z.any().optional(),
});
