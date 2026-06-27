"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = initSocket;
exports.getSocketServer = getSocketServer;
exports.emitToOrganization = emitToOrganization;
exports.emitToPlatform = emitToPlatform;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("./env");
let io = null;
function getCorsOrigins() {
    if (env_1.env.corsOrigin === "*")
        return true;
    return env_1.env.corsOrigin.split(",").map((item) => item.trim());
}
function initSocket(server) {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: getCorsOrigins(),
            credentials: true,
        },
    });
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.replace(/^Bearer\s+/i, "");
        if (!token)
            return next();
        try {
            const payload = jsonwebtoken_1.default.verify(token, env_1.env.jwtSecret);
            socket.data.auth = payload;
            if (payload.organizationId) {
                socket.join(`organization:${payload.organizationId}`);
            }
            if (payload.role === "SUPER_ADMIN") {
                socket.join("platform");
            }
            next();
        }
        catch {
            next();
        }
    });
    io.on("connection", (socket) => {
        const organizationId = socket.handshake.query.organizationId;
        if (organizationId) {
            socket.join(`organization:${organizationId}`);
        }
    });
    return io;
}
function getSocketServer() {
    if (!io) {
        throw new Error("Socket server has not been initialized");
    }
    return io;
}
function emitToOrganization(organizationId, event, payload) {
    if (!io)
        return;
    io.to(`organization:${organizationId}`).emit(event, payload);
}
function emitToPlatform(event, payload) {
    if (!io)
        return;
    io.to("platform").emit(event, payload);
}
