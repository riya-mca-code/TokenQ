"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
exports.createResetToken = createResetToken;
exports.hashResetToken = hashResetToken;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
async function hashPassword(password) {
    return bcryptjs_1.default.hash(password, 12);
}
async function comparePassword(password, hash) {
    return bcryptjs_1.default.compare(password, hash);
}
function createResetToken() {
    return crypto_1.default.randomBytes(32).toString("hex");
}
function hashResetToken(token) {
    return crypto_1.default.createHash("sha256").update(token).digest("hex");
}
