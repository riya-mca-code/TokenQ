import crypto from "crypto";
import type { Response } from "express";
import { env } from "../config/env";
import { Organization } from "../models/Organization";
import { PasswordResetToken } from "../models/PasswordResetToken";
import { User } from "../models/User";
import { sendResetPasswordEmail } from "./mailer.service";
import { comparePassword, createResetToken, hashPassword, hashResetToken } from "../utils/password";
import { signAuthToken } from "../utils/jwt";
import { normalizeEmail, normalizeText } from "../utils/http";
import { slugify } from "../utils/slug";
import { writeAuditLog } from "../utils/audit";

function passwordRegex(password: string) {
  return /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}/.test(password);
}

export async function registerOrganization(input: {
  businessName: string;
  businessType: string;
  ownerName: string;
  email: string;
  phone: string;
  password: string;
  timezone?: string;
  ip?: string;
  userAgent?: string;
}) {
  const email = normalizeEmail(input.email);
  const slugBase = slugify(input.businessName);
  const [existingOrg, existingUser] = await Promise.all([
    Organization.findOne({ $or: [{ email }, { slug: slugBase }] }),
    User.findOne({ email, deletedAt: null }),
  ]);

  if (existingOrg || existingUser) {
    throw Object.assign(new Error("Organization or user already exists"), { status: 409 });
  }

  if (!passwordRegex(input.password)) {
    throw Object.assign(new Error("Password must include upper, lower, number and special character"), { status: 422 });
  }

  const org = await Organization.create({
    name: normalizeText(input.businessName),
    slug: await uniqueSlugWithFallback(slugBase),
    businessType: normalizeText(input.businessType),
    ownerName: normalizeText(input.ownerName),
    email,
    phone: normalizeText(input.phone),
    timezone: normalizeText(input.timezone) || "Asia/Kolkata",
    status: "ACTIVE",
    plan: "FREE",
    branding: {
      displayName: normalizeText(input.businessName),
    },
    defaultWorkspace: {
      name: "Main Workspace",
      slug: "main-workspace",
      timezone: normalizeText(input.timezone) || "Asia/Kolkata",
    },
  });

  const passwordHash = await hashPassword(input.password);
  const user = await User.create({
    organizationId: org._id,
    name: normalizeText(input.ownerName),
    email,
    phone: normalizeText(input.phone),
    passwordHash,
    role: "ADMIN",
    status: "ACTIVE",
    passwordChangedAt: new Date(),
  });

  const token = signAuthToken({
    id: String(user._id),
    organizationId: String(org._id),
    role: "ADMIN",
    email: user.email,
  });

  await writeAuditLog({
    organizationId: String(org._id),
    userId: String(user._id),
    action: "organization.registered",
    entity: "organization",
    entityId: String(org._id),
    ip: input.ip,
    userAgent: input.userAgent,
    meta: { slug: org.slug },
  });

  return {
    organization: serializeOrganization(org),
    user: serializeUser(user),
    token,
  };
}

async function uniqueSlugWithFallback(base: string) {
  const existing = await Organization.findOne({ slug: base });
  if (!existing) return base;

  for (let index = 2; index < 1000; index += 1) {
    const candidate = `${base}-${index}`;
    const found = await Organization.findOne({ slug: candidate });
    if (!found) return candidate;
  }

  return `${base}-${crypto.randomBytes(3).toString("hex")}`;
}

export async function loginUser(input: {
  email: string;
  password: string;
  organizationSlug?: string;
  ip?: string;
  userAgent?: string;
}) {
  const email = normalizeEmail(input.email);
  const organizationSlug = normalizeText(input.organizationSlug);
  let user: any = null;

  if (email === env.superAdminEmail.toLowerCase()) {
    user = await User.findOne({ email, role: "SUPER_ADMIN", deletedAt: null });
  } else {
    const organization = await Organization.findOne({
      slug: organizationSlug,
      deletedAt: null,
    });

    if (!organization) {
      throw Object.assign(new Error("Organization not found"), { status: 404 });
    }

    user = await User.findOne({ organizationId: organization._id, email, deletedAt: null });
  }

  if (!user || user.status !== "ACTIVE") {
    throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  }

  const isValid = await comparePassword(input.password, user.passwordHash);
  if (!isValid) {
    throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signAuthToken({
    id: String(user._id),
    organizationId: user.organizationId ? String(user.organizationId) : null,
    role: user.role,
    email: user.email,
  });

  await writeAuditLog({
    organizationId: user.organizationId ? String(user.organizationId) : null,
    userId: String(user._id),
    action: "auth.login",
    entity: "user",
    entityId: String(user._id),
    ip: input.ip,
    userAgent: input.userAgent,
  });

  return {
    user: serializeUser(user),
    organization: user.organizationId ? await getOrganizationPayload(String(user.organizationId)) : null,
    token,
  };
}

export async function forgotPassword(input: { email: string; organizationSlug?: string; origin: string }) {
  const email = normalizeEmail(input.email);
  const organizationSlug = normalizeText(input.organizationSlug);

  const organizationId = organizationSlug ? await getOrganizationIdBySlug(organizationSlug) : null;
  const user = await User.findOne(
    organizationId ? { email, deletedAt: null, organizationId } : { email, deletedAt: null }
  );

  if (!user) {
    return;
  }

  const plainToken = createResetToken();
  const tokenHash = hashResetToken(plainToken);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await PasswordResetToken.create({
    organizationId: user.organizationId,
    userId: user._id,
    tokenHash,
    expiresAt,
  });

  const resetUrl = `${input.origin.replace(/\/$/, "")}/reset-password?token=${plainToken}`;
  await sendResetPasswordEmail(user.email, resetUrl);

  if (env.nodeEnv !== "production") {
    return { resetUrl };
  }
}

export async function resetPassword(input: { token: string; password: string }) {
  if (!passwordRegex(input.password)) {
    throw Object.assign(new Error("Password must include upper, lower, number and special character"), { status: 422 });
  }

  const tokenHash = hashResetToken(input.token);
  const resetToken = await PasswordResetToken.findOne({
    tokenHash,
    usedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!resetToken) {
    throw Object.assign(new Error("Reset token is invalid or expired"), { status: 400 });
  }

  const user = await User.findById(resetToken.userId);
  if (!user || user.status !== "ACTIVE") {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }

  user.passwordHash = await hashPassword(input.password);
  user.passwordChangedAt = new Date();
  await user.save();

  resetToken.usedAt = new Date();
  await resetToken.save();

  await writeAuditLog({
    organizationId: user.organizationId ? String(user.organizationId) : null,
    userId: String(user._id),
    action: "auth.reset_password",
    entity: "user",
    entityId: String(user._id),
  });

  const token = signAuthToken({
    id: String(user._id),
    organizationId: user.organizationId ? String(user.organizationId) : null,
    role: user.role,
    email: user.email,
  });

  return {
    user: serializeUser(user),
    token,
  };
}

export async function getCurrentUser(userId: string) {
  const user = await User.findById(userId).lean();
  if (!user || user.deletedAt) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }
  const organization = user.organizationId ? await getOrganizationPayload(String(user.organizationId)) : null;
  return {
    user: serializeUser(user),
    organization,
  };
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(AUTH_COOKIE_NAME, {
    path: "/",
    domain: env.cookieDomain || undefined,
  });
}

function serializeOrganization(organization: any) {
  return {
    id: String(organization._id),
    name: organization.name,
    slug: organization.slug,
    businessType: organization.businessType,
    ownerName: organization.ownerName,
    email: organization.email,
    phone: organization.phone,
    status: organization.status,
    plan: organization.plan,
    timezone: organization.timezone,
    branding: organization.branding,
    defaultWorkspace: organization.defaultWorkspace,
  };
}

function serializeUser(user: any) {
  return {
    id: String(user._id),
    organizationId: user.organizationId ? String(user.organizationId) : null,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    lastLoginAt: user.lastLoginAt,
  };
}

async function getOrganizationPayload(organizationId: string) {
  const organization = await Organization.findById(organizationId).lean();
  return organization ? serializeOrganization(organization) : null;
}

async function getOrganizationIdBySlug(slug: string) {
  const org = await Organization.findOne({ slug, deletedAt: null }).lean();
  return org ? String(org._id) : null;
}
