"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allowRoles = allowRoles;
const response_1 = require("../utils/response");
function allowRoles(...roles) {
    return (req, res, next) => {
        if (!req.auth)
            return (0, response_1.sendError)(res, 401, "Authentication required");
        if (!roles.includes(req.auth.role))
            return (0, response_1.sendError)(res, 403, "Access denied");
        return next();
    };
}
