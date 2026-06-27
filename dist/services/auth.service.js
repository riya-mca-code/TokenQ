"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOrganization = registerOrganization;
exports.loginUser = loginUser;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
exports.getCurrentUser = getCurrentUser;
exports.clearAuthCookie = clearAuthCookie;
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
const Organization_1 = require("../models/Organization");
const PasswordResetToken_1 = require("../models/PasswordResetToken");
const User_1 = require("../models/User");
const mailer_service_1 = require("./mailer.service");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const http_1 = require("../utils/http");
const slug_1 = require("../utils/slug");
const audit_1 = require("../utils/audit");
const AUTH_COOKIE_NAME = "tokenq_session";
function passwordRegex(password) {
    return /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}/.test(password);
}
async function registerOrganization(input) {
    const email = (0, http_1.normalizeEmail)(input.email);
    const slugBase = (0, slug_1.slugify)(input.businessName);
    const [existingOrg, existingUser] = await Promise.all([
        Organization_1.Organization.findOne({ $or: [{ email }, { slug: slugBase }] }),
        User_1.User.findOne({ email, deletedAt: null }),
    ]);
    if (existingOrg || existingUser) {
        throw Object.assign(new Error("Organization or user already exists"), { status: 409 });
    }
    if (!passwordRegex(input.password)) {
        throw Object.assign(new Error("Password must include upper, lower, number and special character"), { status: 422 });
    }
    const org = await Organization_1.Organization.create({
        name: (0, http_1.normalizeText)(input.businessName),
        slug: await uniqueSlugWithFallback(slugBase),
        businessType: (0, http_1.normalizeText)(input.businessType),
        ownerName: (0, http_1.normalizeText)(input.ownerName),
        email,
        phone: (0, http_1.normalizeText)(input.phone),
        timezone: (0, http_1.normalizeText)(input.timezone) || "Asia/Kolkata",
        status: "ACTIVE",
        plan: "FREE",
        branding: {
            displayName: (0, http_1.normalizeText)(input.businessName),
        },
        defaultWorkspace: {
            name: "Main Workspace",
            slug: "main-workspace",
            timezone: (0, http_1.normalizeText)(input.timezone) || "Asia/Kolkata",
        },
    });
    const passwordHash = await (0, password_1.hashPassword)(input.password);
    const user = await User_1.User.create({
        organizationId: org._id,
        name: (0, http_1.normalizeText)(input.ownerName),
        email,
        phone: (0, http_1.normalizeText)(input.phone),
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
        passwordChangedAt: new Date(),
    });
    const token = (0, jwt_1.signAuthToken)({
        id: String(user._id),
        organizationId: String(org._id),
        role: "ADMIN",
        email: user.email,
    });
    await (0, audit_1.writeAuditLog)({
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
async function uniqueSlugWithFallback(base) {
    const existing = await Organization_1.Organization.findOne({ slug: base });
    if (!existing)
        return base;
    for (let index = 2; index < 1000; index += 1) {
        const candidate = `${base}-${index}`;
        const found = await Organization_1.Organization.findOne({ slug: candidate });
        if (!found)
            return candidate;
    }
    return `${base}-${crypto_1.default.randomBytes(3).toString("hex")}`;
}
async function loginUser(input) {
    const email = (0, http_1.normalizeEmail)(input.email);
    const organizationSlug = (0, http_1.normalizeText)(input.organizationSlug);
    let user = null;
    if (email === env_1.env.superAdminEmail.toLowerCase()) {
        user = await User_1.User.findOne({ email, role: "SUPER_ADMIN", deletedAt: null });
    }
    else {
        const organization = await Organization_1.Organization.findOne({
            slug: organizationSlug,
            deletedAt: null,
        });
        if (!organization) {
            throw Object.assign(new Error("Organization not found"), { status: 404 });
        }
        user = await User_1.User.findOne({ organizationId: organization._id, email, deletedAt: null });
    }
    if (!user || user.status !== "ACTIVE") {
        throw Object.assign(new Error("Invalid credentials"), { status: 401 });
    }
    const isValid = await (0, password_1.comparePassword)(input.password, user.passwordHash);
    if (!isValid) {
        throw Object.assign(new Error("Invalid credentials"), { status: 401 });
    }
    user.lastLoginAt = new Date();
    await user.save();
    const token = (0, jwt_1.signAuthToken)({
        id: String(user._id),
        organizationId: user.organizationId ? String(user.organizationId) : null,
        role: user.role,
        email: user.email,
    });
    await (0, audit_1.writeAuditLog)({
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
async function forgotPassword(input) {
    const email = (0, http_1.normalizeEmail)(input.email);
    const organizationSlug = (0, http_1.normalizeText)(input.organizationSlug);
    const organizationId = organizationSlug ? await getOrganizationIdBySlug(organizationSlug) : null;
    const user = await User_1.User.findOne(organizationId ? { email, deletedAt: null, organizationId } : { email, deletedAt: null });
    if (!user) {
        return;
    }
    const plainToken = (0, password_1.createResetToken)();
    const tokenHash = (0, password_1.hashResetToken)(plainToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await PasswordResetToken_1.PasswordResetToken.create({
        organizationId: user.organizationId,
        userId: user._id,
        tokenHash,
        expiresAt,
    });
    const resetUrl = `${input.origin.replace(/\/$/, "")}/reset-password?token=${plainToken}`;
    await (0, mailer_service_1.sendResetPasswordEmail)(user.email, resetUrl);
    if (env_1.env.nodeEnv !== "production") {
        return { resetUrl };
    }
}
async function resetPassword(input) {
    if (!passwordRegex(input.password)) {
        throw Object.assign(new Error("Password must include upper, lower, number and special character"), { status: 422 });
    }
    const tokenHash = (0, password_1.hashResetToken)(input.token);
    const resetToken = await PasswordResetToken_1.PasswordResetToken.findOne({
        tokenHash,
        usedAt: null,
        expiresAt: { $gt: new Date() },
    });
    if (!resetToken) {
        throw Object.assign(new Error("Reset token is invalid or expired"), { status: 400 });
    }
    const user = await User_1.User.findById(resetToken.userId);
    if (!user || user.status !== "ACTIVE") {
        throw Object.assign(new Error("User not found"), { status: 404 });
    }
    user.passwordHash = await (0, password_1.hashPassword)(input.password);
    user.passwordChangedAt = new Date();
    await user.save();
    resetToken.usedAt = new Date();
    await resetToken.save();
    await (0, audit_1.writeAuditLog)({
        organizationId: user.organizationId ? String(user.organizationId) : null,
        userId: String(user._id),
        action: "auth.reset_password",
        entity: "user",
        entityId: String(user._id),
    });
    const token = (0, jwt_1.signAuthToken)({
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
async function getCurrentUser(userId) {
    const user = await User_1.User.findById(userId).lean();
    if (!user || user.deletedAt) {
        throw Object.assign(new Error("User not found"), { status: 404 });
    }
    const organization = user.organizationId ? await getOrganizationPayload(String(user.organizationId)) : null;
    return {
        user: serializeUser(user),
        organization,
    };
}
function clearAuthCookie(res) {
    res.clearCookie(AUTH_COOKIE_NAME, {
        path: "/",
        domain: env_1.env.cookieDomain || undefined,
    });
}
function serializeOrganization(organization) {
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
function serializeUser(user) {
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
async function getOrganizationPayload(organizationId) {
    const organization = await Organization_1.Organization.findById(organizationId).lean();
    return organization ? serializeOrganization(organization) : null;
}
async function getOrganizationIdBySlug(slug) {
    const org = await Organization_1.Organization.findOne({ slug, deletedAt: null }).lean();
    return org ? String(org._id) : null;
}
