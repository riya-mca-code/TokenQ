import mongoose, { type InferSchemaType } from "mongoose";

const brandingSchema = new mongoose.Schema(
  {
    primaryColor: { type: String, default: "#2563EB" },
    accentColor: { type: String, default: "#3B82F6" },
    logoUrl: { type: String, default: "" },
    displayName: { type: String, default: "" },
  },
  { _id: false }
);

const defaultWorkspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    timezone: { type: String, default: "Asia/Kolkata" },
  },
  { _id: false }
);

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    businessType: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    phone: { type: String, required: true, trim: true },
    logo: { type: String, default: "" },
    address: { type: String, default: "" },
    timezone: { type: String, default: "Asia/Kolkata" },
    status: { type: String, enum: ["ACTIVE", "SUSPENDED"], default: "ACTIVE", index: true },
    plan: { type: String, enum: ["FREE", "PRO", "ENTERPRISE"], default: "FREE" },
    branding: { type: brandingSchema, default: () => ({}) },
    defaultWorkspace: { type: defaultWorkspaceSchema, required: true },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

organizationSchema.index({ slug: 1, deletedAt: 1 });

export type OrganizationDocument = InferSchemaType<typeof organizationSchema> & mongoose.Document;

export const Organization = mongoose.model<OrganizationDocument>("Organization", organizationSchema);
