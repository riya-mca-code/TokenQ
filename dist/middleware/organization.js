"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveOrganization = resolveOrganization;
const response_1 = require("../utils/response");
function resolveOrganization(req, res, next) {
    if (!req.auth)
        return (0, response_1.sendError)(res, 401, "Authentication required");
    if (req.auth.role === "SUPER_ADMIN") {
        const explicitOrganizationId = (typeof req.params.organizationId === "string" && req.params.organizationId) ||
            (typeof req.query.organizationId === "string" && req.query.organizationId) ||
            (typeof req.body?.organizationId === "string" && req.body.organizationId) ||
            "";
        req.organizationId = explicitOrganizationId || null;
        return next();
    }
    if (!req.auth.organizationId)
        return (0, response_1.sendError)(res, 403, "Organization context required");
    req.organizationId = req.auth.organizationId;
    return next();
}
