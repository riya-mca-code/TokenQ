"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = require("./app");
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const socket_1 = require("./config/socket");
const Organization_1 = require("./models/Organization");
const User_1 = require("./models/User");
const password_1 = require("./utils/password");
async function seedSuperAdmin() {
    if (!env_1.env.superAdminEmail || !env_1.env.superAdminPassword)
        return;
    const email = env_1.env.superAdminEmail.toLowerCase();
    const existing = await User_1.User.findOne({ email, role: "SUPER_ADMIN", deletedAt: null });
    if (existing)
        return;
    await User_1.User.create({
        organizationId: null,
        name: env_1.env.superAdminName,
        email,
        phone: "",
        passwordHash: await (0, password_1.hashPassword)(env_1.env.superAdminPassword),
        role: "SUPER_ADMIN",
        status: "ACTIVE",
        passwordChangedAt: new Date(),
    });
}
async function seedDemoOrganization() {
    const organization = await Organization_1.Organization.findOne({ slug: "default-organization", deletedAt: null });
    if (organization)
        return organization;
    return Organization_1.Organization.create({
        name: "Default Organization",
        slug: "default-organization",
        businessType: "General",
        ownerName: "Owner",
        email: "owner@tokenq.local",
        phone: "0000000000",
        timezone: "Asia/Kolkata",
        status: "ACTIVE",
        plan: "FREE",
        branding: {
            displayName: "TokenQ",
        },
        defaultWorkspace: {
            name: "Main Workspace",
            slug: "main-workspace",
            timezone: "Asia/Kolkata",
        },
    });
}
async function bootstrap() {
    (0, env_1.assertEnv)();
    await (0, db_1.connectDatabase)();
    await seedSuperAdmin();
    await seedDemoOrganization();
    const app = (0, app_1.createApp)();
    const server = http_1.default.createServer(app);
    (0, socket_1.initSocket)(server);
    server.listen(env_1.env.port, () => {
        (0, socket_1.emitToPlatform)("system:ready", {
            status: "ready",
            timestamp: new Date().toISOString(),
        });
    });
}
void bootstrap().catch((error) => {
    console.error(error);
    process.exit(1);
});
