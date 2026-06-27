"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeAuditLog = writeAuditLog;
const AuditLog_1 = require("../models/AuditLog");
async function writeAuditLog(params) {
    await AuditLog_1.AuditLog.create({
        organizationId: params.organizationId || null,
        userId: params.userId || null,
        action: params.action,
        entity: params.entity || "",
        entityId: params.entityId || "",
        ip: params.ip || "",
        userAgent: params.userAgent || "",
        meta: params.meta || {},
    });
}
