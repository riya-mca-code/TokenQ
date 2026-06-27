import http from "http";
import { createApp } from "./app";
import { assertEnv, env } from "./config/env";
import { connectDatabase } from "./config/db";
import { initSocket, emitToPlatform } from "./config/socket";
import { Organization } from "./models/Organization";
import { User } from "./models/User";
import { hashPassword } from "./utils/password";

async function seedSuperAdmin() {
  if (!env.superAdminEmail || !env.superAdminPassword) return;
  const email = env.superAdminEmail.toLowerCase();
  const existing = await User.findOne({ email, role: "SUPER_ADMIN", deletedAt: null });
  if (existing) return;

  await User.create({
    organizationId: null,
    name: env.superAdminName,
    email,
    phone: "",
    passwordHash: await hashPassword(env.superAdminPassword),
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    passwordChangedAt: new Date(),
  });
}

async function seedDemoOrganization() {
  const organization = await Organization.findOne({ slug: "default-organization", deletedAt: null });
  if (organization) return organization;

  return Organization.create({
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
  assertEnv();
  await connectDatabase();
  await seedSuperAdmin();
  await seedDemoOrganization();

  const app = createApp();
  const server = http.createServer(app);
  initSocket(server);

  server.listen(env.port, () => {
    emitToPlatform("system:ready", {
      status: "ready",
      timestamp: new Date().toISOString(),
    });
  });
}

void bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
