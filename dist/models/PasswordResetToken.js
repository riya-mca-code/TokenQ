"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetToken = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const passwordResetTokenSchema = new mongoose_1.default.Schema({
    organizationId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date, default: null },
}, {
    timestamps: true,
    versionKey: false,
});
passwordResetTokenSchema.index({ tokenHash: 1, usedAt: 1 });
exports.PasswordResetToken = mongoose_1.default.model("PasswordResetToken", passwordResetTokenSchema);
