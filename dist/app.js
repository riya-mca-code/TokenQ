"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./config/env");
const health_routes_1 = require("./routes/health.routes");
const routes_1 = require("./routes");
const response_1 = require("./utils/response");
function getCorsOrigins() {
    if (env_1.env.corsOrigin === "*")
        return true;
    return env_1.env.corsOrigin.split(",").map((item) => item.trim());
}
function createApp() {
    const app = (0, express_1.default)();
    app.set("trust proxy", 1);
    app.disable("x-powered-by");
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    }));
    app.use((0, cors_1.default)({
        origin: getCorsOrigins(),
        credentials: true,
    }));
    app.use(express_1.default.json({ limit: "200kb" }));
    app.use(express_1.default.urlencoded({ extended: false }));
    app.use((0, cookie_parser_1.default)());
    app.use((0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000,
        max: 600,
        standardHeaders: true,
        legacyHeaders: false,
    }));
    const authLimiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000,
        max: 30,
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use("/api/health", health_routes_1.healthRoutes);
    app.use("/api/v1/auth", authLimiter);
    app.use("/api/v1", routes_1.apiRoutes);
    app.use((req, res, next) => {
        if (req.path.startsWith("/api"))
            return (0, response_1.sendError)(res, 404, "Not found");
        return next();
    });
    app.use((err, req, res, next) => {
        if (res.headersSent)
            return next(err);
        const status = err.status || 500;
        const message = status === 500 ? "Internal Server Error" : err.message || "Request failed";
        return res.status(status).json({
            success: false,
            message,
        });
    });
    return app;
}
