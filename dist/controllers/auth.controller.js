"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerController = registerController;
exports.loginController = loginController;
exports.logoutController = logoutController;
exports.meController = meController;
exports.forgotPasswordController = forgotPasswordController;
exports.resetPasswordController = resetPasswordController;
const env_1 = require("../config/env");
const auth_service_1 = require("../services/auth.service");
const response_1 = require("../utils/response");
const AUTH_COOKIE_NAME = "tokenq_session";
function setAuthCookie(res, token) {
    res.cookie(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: env_1.env.cookieSecure,
        sameSite: "lax",
        path: "/",
        domain: env_1.env.cookieDomain || undefined,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}
async function registerController(req, res, next) {
    try {
        const result = await (0, auth_service_1.registerOrganization)({
            businessName: req.body.businessName,
            businessType: req.body.businessType,
            ownerName: req.body.ownerName,
            email: req.body.email,
            phone: req.body.phone,
            password: req.body.password,
            timezone: req.body.timezone,
            ip: req.ip,
            userAgent: req.get("user-agent") || "",
        });
        setAuthCookie(res, result.token);
        return (0, response_1.sendSuccess)(res, "Organization registered successfully", result, 201);
    }
    catch (error) {
        return next(error);
    }
}
async function loginController(req, res, next) {
    try {
        const result = await (0, auth_service_1.loginUser)({
            email: req.body.email,
            password: req.body.password,
            organizationSlug: req.body.organizationSlug,
            ip: req.ip,
            userAgent: req.get("user-agent") || "",
        });
        setAuthCookie(res, result.token);
        return (0, response_1.sendSuccess)(res, "Logged in successfully", result);
    }
    catch (error) {
        return next(error);
    }
}
async function logoutController(req, res) {
    (0, auth_service_1.clearAuthCookie)(res);
    return (0, response_1.sendSuccess)(res, "Logged out successfully", {});
}
async function meController(req, res, next) {
    try {
        if (!req.auth)
            return (0, response_1.sendError)(res, 401, "Authentication required");
        const result = await (0, auth_service_1.getCurrentUser)(req.auth.id);
        return (0, response_1.sendSuccess)(res, "Current user", result);
    }
    catch (error) {
        return next(error);
    }
}
async function forgotPasswordController(req, res, next) {
    try {
        const result = await (0, auth_service_1.forgotPassword)({
            email: req.body.email,
            organizationSlug: req.body.organizationSlug,
            origin: `${req.protocol}://${req.get("host")}`,
        });
        return (0, response_1.sendSuccess)(res, "If the account exists, a reset link has been sent", result || {});
    }
    catch (error) {
        return next(error);
    }
}
async function resetPasswordController(req, res, next) {
    try {
        const result = await (0, auth_service_1.resetPassword)({
            token: req.body.token,
            password: req.body.password,
        });
        setAuthCookie(res, result.token);
        return (0, response_1.sendSuccess)(res, "Password reset successfully", result);
    }
    catch (error) {
        return next(error);
    }
}
