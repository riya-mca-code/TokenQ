import mongoose, { type InferSchemaType } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, default: "" },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["SUPER_ADMIN", "OWNER", "ADMIN", "STAFF"], required: true, index: true },
    status: { type: String, enum: ["ACTIVE", "DISABLED"], default: "ACTIVE", index: true },
    lastLoginAt: { type: Date, default: null },
    passwordChangedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.index({ organizationId: 1, email: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });

export type UserDocument = InferSchemaType<typeof userSchema> & mongoose.Document;

export const User = mongoose.model<UserDocument>("User", userSchema);
