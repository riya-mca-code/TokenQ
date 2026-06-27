"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAuthToken = signAuthToken;
exports.verifyAuthToken = verifyAuthToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function signAuthToken(session) {
    return jsonwebtoken_1.default.sign({
        id: session.id,
        organizationId: session.organizationId,
        role: session.role,
        email: session.email,
    }, env_1.env.jwtSecret, { expiresIn: env_1.env.jwtExpiresIn });
}
function verifyAuthToken(token) {
    return jsonwebtoken_1.default.verify(token, env_1.env.jwtSecret);
}
