"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    organizationId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, default: "" },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["SUPER_ADMIN", "ADMIN", "STAFF"], required: true, index: true },
    status: { type: String, enum: ["ACTIVE", "DISABLED"], default: "ACTIVE", index: true },
    lastLoginAt: { type: Date, default: null },
    passwordChangedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
}, {
    timestamps: true,
    versionKey: false,
});
userSchema.index({ organizationId: 1, email: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });
exports.User = mongoose_1.default.model("User", userSchema);
