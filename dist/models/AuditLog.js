"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLog = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const auditLogSchema = new mongoose_1.default.Schema({
    organizationId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    action: { type: String, required: true, trim: true },
    entity: { type: String, default: "" },
    entityId: { type: String, default: "" },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    meta: { type: Object, default: {} },
}, {
    timestamps: true,
    versionKey: false,
});
exports.AuditLog = mongoose_1.default.model("AuditLog", auditLogSchema);
