"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRequired = authRequired;
const jwt_1 = require("../utils/jwt");
const response_1 = require("../utils/response");
function getTokenFromRequest(req) {
    const header = req.header("authorization");
    if (header?.startsWith("Bearer "))
        return header.slice(7);
    return req.cookies?.tokenq_session || "";
}
function authRequired(req, res, next) {
    const token = getTokenFromRequest(req);
    if (!token)
        return (0, response_1.sendError)(res, 401, "Authentication required");
    try {
        req.auth = (0, jwt_1.verifyAuthToken)(token);
        if (req.auth.organizationId) {
            req.organizationId = req.auth.organizationId;
        }
        return next();
    }
    catch {
        return (0, response_1.sendError)(res, 401, "Authentication required");
    }
}
