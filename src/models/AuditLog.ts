import mongoose, { type InferSchemaType } from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    action: { type: String, required: true, trim: true },
    entity: { type: String, default: "" },
    entityId: { type: String, default: "" },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    meta: { type: Object, default: {} },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export type AuditLogDocument = InferSchemaType<typeof auditLogSchema> & mongoose.Document;

export const AuditLog = mongoose.model<AuditLogDocument>("AuditLog", auditLogSchema);
