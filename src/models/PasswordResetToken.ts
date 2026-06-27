import mongoose, { type InferSchemaType } from "mongoose";

const passwordResetTokenSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

passwordResetTokenSchema.index({ tokenHash: 1, usedAt: 1 });

export type PasswordResetTokenDocument = InferSchemaType<typeof passwordResetTokenSchema> & mongoose.Document;

export const PasswordResetToken = mongoose.model<PasswordResetTokenDocument>(
  "PasswordResetToken",
  passwordResetTokenSchema
);
