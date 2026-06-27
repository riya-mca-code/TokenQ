"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationIdParamSchema = void 0;
const zod_1 = require("zod");
exports.organizationIdParamSchema = zod_1.z.object({
    body: zod_1.z.any().optional(),
    query: zod_1.z.any().optional(),
    params: zod_1.z.object({
        organizationId: zod_1.z.string().min(1),
    }),
});
