require("dotenv").config();

const http = require("http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/tokenq";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "superadmin@tokenq.local";
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || "superadmin123";
const SUPER_ADMIN_NAME = process.env.SUPER_ADMIN_NAME || "Super Admin";
const DEFAULT_ORG_NAME = process.env.DEFAULT_ORG_NAME || "Default Organization";
const DEFAULT_ORG_TYPE = process.env.DEFAULT_ORG_TYPE || "General";
const DEFAULT_OWNER_NAME = process.env.DEFAULT_OWNER_NAME || "Owner";
const DEFAULT_ORG_EMAIL = process.env.DEFAULT_ORG_EMAIL || "owner@tokenq.local";
const DEFAULT_ORG_PHONE = process.env.DEFAULT_ORG_PHONE || "0000000000";
const DEFAULT_ORG_PASSWORD = process.env.DEFAULT_ORG_PASSWORD || "admin123";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN.split(",").map((v) => v.trim()) },
});

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN.split(",").map((v) => v.trim()), credentials: true }));
app.use(express.json({ limit: "200kb" }));
app.use(express.static(__dirname));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 600,
  })
);

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });
const publicLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });

const objectId = mongoose.Schema.Types.ObjectId;

const organizationSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true, trim: true },
    businessType: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
  },
  { timestamps: true, versionKey: false }
);

const userSchema = new mongoose.Schema(
  {
    organizationId: { type: objectId, ref: "Organization", default: null, index: true },
    role: { type: String, enum: ["super_admin", "org_admin", "staff"], required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, default: "" },
    passwordHash: { type: String, required: true },
    status: { type: String, enum: ["active", "disabled"], default: "active" },
  },
  { timestamps: true, versionKey: false }
);

const queueSchema = new mongoose.Schema(
  {
    organizationId: { type: objectId, ref: "Organization", required: true, index: true },
    name: { type: String, required: true, trim: true },
    tokenPrefix: { type: String, default: "A" },
    isDefault: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true, versionKey: false }
);

const counterSchema = new mongoose.Schema(
  {
    organizationId: { type: objectId, ref: "Organization", required: true, index: true },
    queueId: { type: objectId, ref: "Queue", required: true, index: true },
    name: { type: String, required: true, trim: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true, versionKey: false }
);

const queueItemSchema = new mongoose.Schema(
  {
    organizationId: { type: objectId, ref: "Organization", required: true, index: true },
    queueId: { type: objectId, ref: "Queue", required: true, index: true },
    counterId: { type: objectId, ref: "Counter", default: null },
    token: { type: String, required: true, index: true },
    sequence: { type: Number, required: true, index: true },
    customerName: { type: String, required: true, trim: true },
    customerMobile: { type: String, required: true, trim: true },
    customerEmail: { type: String, default: "" },
    purpose: { type: String, default: "" },
    createdBy: { type: String, default: "customer" },
    customerPhone: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["waiting", "serving", "completed", "skipped", "missed"],
      default: "waiting",
      index: true,
    },
    calledAt: { type: Date, default: null },
    servedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    skippedAt: { type: Date, default: null },
    missedAt: { type: Date, default: null },
    servedBy: { type: objectId, ref: "User", default: null },
  },
  { timestamps: true, versionKey: false }
);

const auditLogSchema = new mongoose.Schema(
  {
    organizationId: { type: objectId, ref: "Organization", default: null, index: true },
    actorUserId: { type: objectId, ref: "User", default: null },
    actorRole: { type: String, default: "system" },
    action: { type: String, required: true },
    meta: { type: Object, default: {} },
  },
  { timestamps: true, versionKey: false }
);

const Organization = mongoose.model("Organization", organizationSchema);
const User = mongoose.model("User", userSchema);
const Queue = mongoose.model("Queue", queueSchema);
const Counter = mongoose.model("Counter", counterSchema);
const QueueItem = mongoose.model("QueueItem", queueItemSchema);
const AuditLog = mongoose.model("AuditLog", auditLogSchema);

function toId(value) {
  return value ? String(value) : "";
}

function parseBodyString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^[0-9+\-\s()]{7,20}$/.test(phone);
}

function normalizeOrgId(req, fallback = null) {
  return (
    req.user?.organizationId ||
    req.body?.organizationId ||
    req.query?.organizationId ||
    req.headers["x-organization-id"] ||
    fallback
  );
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

function signJwt(user) {
  return jwt.sign(
    {
      sub: toId(user._id),
      role: user.role,
      organizationId: user.organizationId ? toId(user.organizationId) : null,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: "8h" }
  );
}

function signTenantToken(organizationId) {
  return jwt.sign({ organizationId: toId(organizationId), role: "customer" }, JWT_SECRET, { expiresIn: "7d" });
}

function verifyTenantToken(req) {
  const token = req.headers["x-tenant-token"];
  if (!token) return "";
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload.organizationId || "";
  } catch {
    return "";
  }
}

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
}

function allow(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    next();
  };
}

async function audit({ organizationId = null, actorUserId = null, actorRole = "system", action, meta = {} }) {
  await AuditLog.create({ organizationId, actorUserId, actorRole, action, meta });
}

async function getDefaultQueue(organizationId) {
  return Queue.findOne({ organizationId, isDefault: true, status: "active" }).sort({ createdAt: 1 });
}

async function getDefaultCounter(organizationId) {
  return Counter.findOne({ organizationId, status: "active" }).sort({ createdAt: 1 });
}

async function ensureDefaultOrg() {
  const existing = await Organization.findOne({ email: DEFAULT_ORG_EMAIL });
  if (existing) return existing;

  const passwordHash = await hashPassword(DEFAULT_ORG_PASSWORD);
  const org = await Organization.create({
    businessName: DEFAULT_ORG_NAME,
    businessType: DEFAULT_ORG_TYPE,
    ownerName: DEFAULT_OWNER_NAME,
    email: DEFAULT_ORG_EMAIL,
    phone: DEFAULT_ORG_PHONE,
    passwordHash,
    status: "active",
  });

  const admin = await User.create({
    organizationId: org._id,
    role: "org_admin",
    name: DEFAULT_OWNER_NAME,
    email: DEFAULT_ORG_EMAIL,
    phone: DEFAULT_ORG_PHONE,
    passwordHash,
  });

  const queue = await Queue.create({
    organizationId: org._id,
    name: "Main Queue",
    tokenPrefix: "A",
    isDefault: true,
    status: "active",
  });

  await Counter.create({
    organizationId: org._id,
    queueId: queue._id,
    name: "Counter 1",
    status: "active",
  });

  await audit({ organizationId: org._id, actorUserId: admin._id, actorRole: "org_admin", action: "bootstrap_created" });
  return org;
}

async function seedSuperAdmin() {
  const exists = await User.findOne({ role: "super_admin", email: SUPER_ADMIN_EMAIL });
  if (exists) return exists;

  const passwordHash = await hashPassword(SUPER_ADMIN_PASSWORD);
  return User.create({
    organizationId: null,
    role: "super_admin",
    name: SUPER_ADMIN_NAME,
    email: SUPER_ADMIN_EMAIL,
    phone: "",
    passwordHash,
  });
}

async function getUserByLogin(email, organizationId) {
  const normalizedEmail = String(email || "").toLowerCase();
  if (normalizedEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
    return User.findOne({ role: "super_admin", email: normalizedEmail });
  }
  if (!organizationId) return null;
  return User.findOne({ organizationId, email: normalizedEmail });
}

async function verifyPassword(password, storedHash) {
  return bcrypt.compare(password, storedHash);
}

async function queueSummary(organizationId) {
  const items = await QueueItem.find({ organizationId }).sort({ createdAt: 1 }).lean();
  const counts = items.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    },
    { waiting: 0, serving: 0, completed: 0, skipped: 0, missed: 0 }
  );
  const total = items.length;
  const completedSet = items.filter((item) => item.completedAt).map((item) => new Date(item.completedAt).getTime() - new Date(item.createdAt).getTime());
  const avgWaitMs = completedSet.length ? completedSet.reduce((sum, v) => sum + v, 0) / completedSet.length : 0;
  return {
    total,
    ...counts,
    avgWaitMinutes: Math.round((avgWaitMs / 60000) * 10) / 10,
    recent: items.slice(-20),
    items,
  };
}

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function emitOrgUpdate(organizationId) {
  io.to(`org:${toId(organizationId)}`).emit("queue:update", { organizationId: toId(organizationId) });
}

function emitSuperUpdate() {
  io.to("super-admin").emit("system:update");
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/public/bootstrap", async (req, res, next) => {
  try {
    const org = (await Organization.findOne({ status: "active" }).sort({ createdAt: 1 })) || (await ensureDefaultOrg());
    res.json({
      organizationId: toId(org._id),
      businessName: org.businessName,
      businessType: org.businessType,
      tenantToken: signTenantToken(org._id),
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/public/organizations/register", publicLimiter, async (req, res, next) => {
  try {
    const businessName = parseBodyString(req.body.businessName);
    const businessType = parseBodyString(req.body.businessType);
    const ownerName = parseBodyString(req.body.ownerName);
    const email = parseBodyString(req.body.email).toLowerCase();
    const phone = parseBodyString(req.body.phone);
    const password = parseBodyString(req.body.password);

    if (!businessName || !businessType || !ownerName || !email || !phone || !password) {
      return res.status(400).json({ message: "All registration fields are required" });
    }
    if (!validateEmail(email) || !validatePhone(phone) || password.length < 8) {
      return res.status(400).json({ message: "Invalid registration data" });
    }
    const existing = await Organization.findOne({ email });
    if (existing) return res.status(409).json({ message: "Organization already exists" });

    const passwordHash = await hashPassword(password);
    const org = await Organization.create({
      businessName,
      businessType,
      ownerName,
      email,
      phone,
      passwordHash,
      status: "active",
    });

    const admin = await User.create({
      organizationId: org._id,
      role: "org_admin",
      name: ownerName,
      email,
      phone,
      passwordHash,
      status: "active",
    });

    const queue = await Queue.create({
      organizationId: org._id,
      name: "Main Queue",
      tokenPrefix: "A",
      isDefault: true,
      status: "active",
    });

    const counter = await Counter.create({
      organizationId: org._id,
      queueId: queue._id,
      name: "Counter 1",
      status: "active",
    });

    await audit({ organizationId: org._id, actorUserId: admin._id, actorRole: "org_admin", action: "organization_registered" });

    const token = signJwt(admin);
    res.status(201).json({
      organization: {
        id: toId(org._id),
        businessName: org.businessName,
        businessType: org.businessType,
      },
      admin: {
        id: toId(admin._id),
        role: admin.role,
        name: admin.name,
        email: admin.email,
      },
      queue: { id: toId(queue._id), name: queue.name },
      counter: { id: toId(counter._id), name: counter.name },
      token,
      tenantToken: signTenantToken(org._id),
    });
    emitSuperUpdate();
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/login", authLimiter, async (req, res, next) => {
  try {
    const email = parseBodyString(req.body.email).toLowerCase();
    const password = parseBodyString(req.body.password);
    const organizationId = req.body.organizationId || req.query.organizationId || null;

    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const user = await getUserByLogin(email, organizationId);
    if (!user || user.status !== "active") return res.status(401).json({ message: "Invalid credentials" });
    if (user.role !== "super_admin" && !organizationId) {
      return res.status(400).json({ message: "Organization is required" });
    }

    if (user.role !== "super_admin" && user.organizationId && organizationId && toId(user.organizationId) !== toId(organizationId)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    if (user.role !== "super_admin") {
      const org = await Organization.findById(user.organizationId);
      if (!org || org.status !== "active") return res.status(403).json({ message: "Organization suspended" });
    }

    const token = signJwt(user);
    res.json({
      token,
      user: {
        id: toId(user._id),
        role: user.role,
        name: user.name,
        email: user.email,
        organizationId: user.organizationId ? toId(user.organizationId) : null,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/auth/me", auth, async (req, res) => {
  res.json({ user: req.user });
});

app.get("/api/public/organizations/:organizationId", async (req, res, next) => {
  try {
    const org = await Organization.findById(req.params.organizationId).lean();
    if (!org) return res.status(404).json({ message: "Organization not found" });
    res.json({
      organization: {
        id: toId(org._id),
        businessName: org.businessName,
        businessType: org.businessType,
        status: org.status,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/queue", async (req, res, next) => {
  try {
    const organizationId = verifyTenantToken(req);
    if (!organizationId) return res.status(401).json({ message: "Unauthorized" });
    const org = await Organization.findById(organizationId);
    if (!org) return res.status(404).json({ message: "Organization not found" });

    const summary = await queueSummary(organizationId);
    const queue = summary.items;
    res.json({ queue, stats: summary, organization: { id: toId(org._id), businessName: org.businessName, businessType: org.businessType } });
  } catch (error) {
    next(error);
  }
});

app.post("/api/queue", publicLimiter, async (req, res, next) => {
  try {
    const organizationId = verifyTenantToken(req);
    const customerName = parseBodyString(req.body.customerName);
    const customerMobile = parseBodyString(req.body.customerMobile);
    const customerEmail = parseBodyString(req.body.customerEmail).toLowerCase();
    const purpose = parseBodyString(req.body.purpose);

    if (!organizationId) return res.status(401).json({ message: "Unauthorized" });
    if (!customerName || !customerMobile) return res.status(400).json({ message: "Customer name and mobile are required" });
    if (customerEmail && !validateEmail(customerEmail)) return res.status(400).json({ message: "Invalid customer email" });
    if (!validatePhone(customerMobile)) return res.status(400).json({ message: "Invalid mobile number" });

    const org = await Organization.findById(organizationId);
    if (!org) return res.status(404).json({ message: "Organization not found" });
    if (org.status !== "active") return res.status(403).json({ message: "Organization suspended" });

    const queue = await getDefaultQueue(organizationId);
    if (!queue) return res.status(400).json({ message: "Default queue not configured" });

    const duplicate = await QueueItem.findOne({
      organizationId,
      status: { $in: ["waiting", "serving"] },
      $or: [{ customerMobile }, { customerPhone: customerMobile }],
    }).lean();
    if (duplicate) return res.status(409).json({ message: "An active token already exists for this mobile number" });

    const sequence = (await QueueItem.countDocuments({ organizationId })) + 1;
    const token = `${queue.tokenPrefix}${String(sequence).padStart(3, "0")}`;
    const counter = await getDefaultCounter(organizationId);

    const item = await QueueItem.create({
      organizationId,
      queueId: queue._id,
      counterId: counter ? counter._id : null,
      token,
      sequence,
      customerName,
      customerMobile,
      customerPhone: customerMobile,
      customerEmail,
      purpose,
      createdBy: "customer",
      status: "waiting",
    });

    await audit({
      organizationId,
      actorRole: "customer",
      action: "token_created",
      meta: { token, customerName, customerMobile },
    });

    const summary = await queueSummary(organizationId);
    res.status(201).json({ token: item, queue: summary.items, stats: summary });
    emitOrgUpdate(organizationId);
    emitSuperUpdate();
  } catch (error) {
    next(error);
  }
});

app.get("/api/org/dashboard", auth, allow("org_admin", "staff"), async (req, res, next) => {
  try {
    const organizationId = normalizeOrgId(req);
    const org = await Organization.findById(organizationId);
    if (!org) return res.status(404).json({ message: "Organization not found" });
    const summary = await queueSummary(organizationId);
    const staff = await User.find({ organizationId, role: "staff" }).lean();
    const counters = await Counter.find({ organizationId }).sort({ createdAt: 1 }).lean();
    res.json({ organization: org, stats: summary, staff, counters });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/org/queue/next", auth, allow("org_admin", "staff"), async (req, res, next) => {
  try {
    const organizationId = normalizeOrgId(req);
    const current = await QueueItem.findOne({ organizationId, status: "serving" }).sort({ createdAt: 1 });
    if (current) {
      current.status = "completed";
      current.completedAt = new Date();
      await current.save();
    }

    const nextItem = await QueueItem.findOne({ organizationId, status: "waiting" }).sort({ createdAt: 1 });
    if (!nextItem) {
      const summary = await queueSummary(organizationId);
      await audit({ organizationId, actorUserId: req.user.sub, actorRole: req.user.role, action: "queue_next_empty" });
      return res.json({ message: "No waiting customers", queue: summary.items, stats: summary });
    }

    nextItem.status = "serving";
    nextItem.calledAt = new Date();
    nextItem.servedAt = new Date();
    nextItem.servedBy = req.user.sub;
    await nextItem.save();
    const summary = await queueSummary(organizationId);
    await audit({ organizationId, actorUserId: req.user.sub, actorRole: req.user.role, action: "queue_next", meta: { token: nextItem.token } });
    res.json({ message: `Now serving ${nextItem.token}`, queue: summary.items, stats: summary });
    emitOrgUpdate(organizationId);
  } catch (error) {
    next(error);
  }
});

app.patch("/api/org/queue/complete", auth, allow("org_admin", "staff"), async (req, res, next) => {
  try {
    const organizationId = normalizeOrgId(req);
    const current = await QueueItem.findOne({ organizationId, status: "serving" }).sort({ createdAt: 1 });
    if (!current) return res.status(400).json({ message: "No active serving token" });

    current.status = "completed";
    current.completedAt = new Date();
    await current.save();
    const summary = await queueSummary(organizationId);
    await audit({ organizationId, actorUserId: req.user.sub, actorRole: req.user.role, action: "queue_complete", meta: { token: current.token } });
    res.json({ message: `${current.token} completed`, queue: summary.items, stats: summary });
    emitOrgUpdate(organizationId);
  } catch (error) {
    next(error);
  }
});

app.patch("/api/org/queue/skip", auth, allow("org_admin", "staff"), async (req, res, next) => {
  try {
    const organizationId = normalizeOrgId(req);
    const current = await QueueItem.findOne({ organizationId, status: "serving" }).sort({ createdAt: 1 });
    if (current) {
      current.status = "skipped";
      current.skippedAt = new Date();
      await current.save();
    }

    const nextItem = await QueueItem.findOne({ organizationId, status: "waiting" }).sort({ createdAt: 1 });
    if (nextItem) {
      nextItem.status = "serving";
      nextItem.calledAt = new Date();
      nextItem.servedAt = new Date();
      nextItem.servedBy = req.user.sub;
      await nextItem.save();
    }

    const summary = await queueSummary(organizationId);
    await audit({ organizationId, actorUserId: req.user.sub, actorRole: req.user.role, action: "queue_skip", meta: { skipped: current?.token || null, next: nextItem?.token || null } });
    res.json({ message: nextItem ? `Skipped and serving ${nextItem.token}` : "Skipped current token", queue: summary.items, stats: summary });
    emitOrgUpdate(organizationId);
  } catch (error) {
    next(error);
  }
});

app.patch("/api/org/queue/missed", auth, allow("org_admin", "staff"), async (req, res, next) => {
  try {
    const organizationId = normalizeOrgId(req);
    const token = parseBodyString(req.body.token || req.query.token);
    if (!token) return res.status(400).json({ message: "Token is required" });
    const item = await QueueItem.findOne({ organizationId, token });
    if (!item) return res.status(404).json({ message: "Token not found" });
    item.status = "missed";
    item.missedAt = new Date();
    await item.save();
    const summary = await queueSummary(organizationId);
    await audit({ organizationId, actorUserId: req.user.sub, actorRole: req.user.role, action: "queue_missed", meta: { token } });
    res.json({ message: `${token} marked missed`, queue: summary.items, stats: summary });
    emitOrgUpdate(organizationId);
  } catch (error) {
    next(error);
  }
});

app.get("/api/org/queue/search", auth, allow("org_admin", "staff"), async (req, res, next) => {
  try {
    const organizationId = normalizeOrgId(req);
    const q = parseBodyString(req.query.q || req.query.token || req.body.q || req.body.token).toLowerCase();
    if (!q) return res.status(400).json({ message: "Search query is required" });
    const item = await QueueItem.findOne({
      organizationId,
      $or: [
        { token: new RegExp(q, "i") },
        { customerName: new RegExp(q, "i") },
        { customerMobile: new RegExp(q, "i") },
        { customerEmail: new RegExp(q, "i") },
      ],
    }).lean();
    if (!item) return res.status(404).json({ message: "Token not found" });
    res.json({ item });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/org/queue", auth, allow("org_admin"), async (req, res, next) => {
  try {
    const organizationId = normalizeOrgId(req);
    await QueueItem.deleteMany({ organizationId });
    const summary = await queueSummary(organizationId);
    await audit({ organizationId, actorUserId: req.user.sub, actorRole: req.user.role, action: "queue_reset" });
    res.json({ message: "Queue reset completed", queue: summary.items, stats: summary });
    emitOrgUpdate(organizationId);
  } catch (error) {
    next(error);
  }
});

app.get("/api/org/analytics", auth, allow("org_admin", "staff"), async (req, res, next) => {
  try {
    const organizationId = normalizeOrgId(req);
    const summary = await queueSummary(organizationId);
    const counters = await Counter.find({ organizationId }).lean();
    res.json({ stats: summary, counters });
  } catch (error) {
    next(error);
  }
});

app.get("/api/org/export.csv", auth, allow("org_admin"), async (req, res, next) => {
  try {
    const organizationId = normalizeOrgId(req);
    const items = await QueueItem.find({ organizationId }).sort({ createdAt: 1 }).lean();
    const csv = [
      "Token,Customer Name,Mobile,Email,Purpose,Status,Created At",
      ...items.map((item) =>
        [
          csvEscape(item.token),
          csvEscape(item.customerName),
          csvEscape(item.customerMobile),
          csvEscape(item.customerEmail),
          csvEscape(item.purpose),
          csvEscape(item.status),
          csvEscape(item.createdAt),
        ].join(",")
      ),
    ].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="queue-report.csv"');
    res.send(csv);
    await audit({ organizationId, actorUserId: req.user.sub, actorRole: req.user.role, action: "report_exported" });
  } catch (error) {
    next(error);
  }
});

app.get("/api/org/staff", auth, allow("org_admin"), async (req, res, next) => {
  try {
    const organizationId = normalizeOrgId(req);
    const users = await User.find({ organizationId, role: "staff" }).sort({ createdAt: -1 }).lean();
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

app.post("/api/org/staff", auth, allow("org_admin"), async (req, res, next) => {
  try {
    const organizationId = normalizeOrgId(req);
    const name = parseBodyString(req.body.name);
    const email = parseBodyString(req.body.email).toLowerCase();
    const phone = parseBodyString(req.body.phone);
    const password = parseBodyString(req.body.password);
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required" });
    if (!validateEmail(email) || (phone && !validatePhone(phone)) || password.length < 8) {
      return res.status(400).json({ message: "Invalid staff data" });
    }
    const exists = await User.findOne({ organizationId, email });
    if (exists) return res.status(409).json({ message: "Staff already exists" });
    const staff = await User.create({
      organizationId,
      role: "staff",
      name,
      email,
      phone,
      passwordHash: await hashPassword(password),
    });
    await audit({ organizationId, actorUserId: req.user.sub, actorRole: req.user.role, action: "staff_created", meta: { email } });
    res.status(201).json({ user: staff });
    emitOrgUpdate(organizationId);
  } catch (error) {
    next(error);
  }
});

app.patch("/api/org/staff/:id", auth, allow("org_admin"), async (req, res, next) => {
  try {
    const organizationId = normalizeOrgId(req);
    const user = await User.findOne({ _id: req.params.id, organizationId, role: "staff" });
    if (!user) return res.status(404).json({ message: "Staff not found" });
    if (req.body.name) user.name = parseBodyString(req.body.name);
    if (req.body.email) user.email = parseBodyString(req.body.email).toLowerCase();
    if (req.body.phone !== undefined) user.phone = parseBodyString(req.body.phone);
    if (req.body.password) user.passwordHash = await hashPassword(parseBodyString(req.body.password));
    if (req.body.status) user.status = req.body.status;
    await user.save();
    await audit({ organizationId, actorUserId: req.user.sub, actorRole: req.user.role, action: "staff_updated", meta: { userId: toId(user._id) } });
    res.json({ user });
    emitOrgUpdate(organizationId);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/org/staff/:id", auth, allow("org_admin"), async (req, res, next) => {
  try {
    const organizationId = normalizeOrgId(req);
    const user = await User.findOne({ _id: req.params.id, organizationId, role: "staff" });
    if (!user) return res.status(404).json({ message: "Staff not found" });
    user.status = "disabled";
    await user.save();
    await audit({ organizationId, actorUserId: req.user.sub, actorRole: req.user.role, action: "staff_disabled", meta: { userId: toId(user._id) } });
    res.json({ message: "Staff disabled" });
    emitOrgUpdate(organizationId);
  } catch (error) {
    next(error);
  }
});

app.get("/api/org/counters", auth, allow("org_admin"), async (req, res, next) => {
  try {
    const organizationId = normalizeOrgId(req);
    const counters = await Counter.find({ organizationId }).sort({ createdAt: -1 }).lean();
    res.json({ counters });
  } catch (error) {
    next(error);
  }
});

app.post("/api/org/counters", auth, allow("org_admin"), async (req, res, next) => {
  try {
    const organizationId = normalizeOrgId(req);
    const name = parseBodyString(req.body.name);
    const queueId = req.body.queueId || (await getDefaultQueue(organizationId))?._id;
    if (!name || !queueId) return res.status(400).json({ message: "Counter name and queue are required" });
    const counter = await Counter.create({ organizationId, queueId, name, status: "active" });
    await audit({ organizationId, actorUserId: req.user.sub, actorRole: req.user.role, action: "counter_created", meta: { name } });
    res.status(201).json({ counter });
    emitOrgUpdate(organizationId);
  } catch (error) {
    next(error);
  }
});

app.patch("/api/org/counters/:id", auth, allow("org_admin"), async (req, res, next) => {
  try {
    const organizationId = normalizeOrgId(req);
    const counter = await Counter.findOne({ _id: req.params.id, organizationId });
    if (!counter) return res.status(404).json({ message: "Counter not found" });
    if (req.body.name) counter.name = parseBodyString(req.body.name);
    if (req.body.status) counter.status = req.body.status;
    if (req.body.queueId) counter.queueId = req.body.queueId;
    await counter.save();
    await audit({ organizationId, actorUserId: req.user.sub, actorRole: req.user.role, action: "counter_updated", meta: { counterId: toId(counter._id) } });
    res.json({ counter });
    emitOrgUpdate(organizationId);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/org/counters/:id", auth, allow("org_admin"), async (req, res, next) => {
  try {
    const organizationId = normalizeOrgId(req);
    const counter = await Counter.findOneAndDelete({ _id: req.params.id, organizationId });
    if (!counter) return res.status(404).json({ message: "Counter not found" });
    await audit({ organizationId, actorUserId: req.user.sub, actorRole: req.user.role, action: "counter_deleted", meta: { counterId: toId(counter._id) } });
    res.json({ message: "Counter deleted" });
    emitOrgUpdate(organizationId);
  } catch (error) {
    next(error);
  }
});

app.get("/api/super/organizations", auth, allow("super_admin"), async (req, res, next) => {
  try {
    const organizations = await Organization.find().sort({ createdAt: -1 }).lean();
    const enriched = await Promise.all(
      organizations.map(async (org) => {
        const stats = await queueSummary(org._id);
        return {
          id: toId(org._id),
          businessName: org.businessName,
          businessType: org.businessType,
          ownerName: org.ownerName,
          email: org.email,
          phone: org.phone,
          status: org.status,
          totals: stats,
        };
      })
    );
    res.json({ organizations: enriched });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/super/organizations/:id/suspend", auth, allow("super_admin"), async (req, res, next) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ message: "Organization not found" });
    org.status = org.status === "suspended" ? "active" : "suspended";
    await org.save();
    await audit({ organizationId: org._id, actorUserId: req.user.sub, actorRole: req.user.role, action: "organization_status_changed", meta: { status: org.status } });
    res.json({ organization: org });
    emitSuperUpdate();
  } catch (error) {
    next(error);
  }
});

app.get("/api/super/admins", auth, allow("super_admin"), async (req, res, next) => {
  try {
    const organizationId = req.query.organizationId || null;
    const admins = await User.find(
      organizationId ? { organizationId, role: "org_admin" } : { role: "org_admin" }
    ).sort({ createdAt: -1 }).lean();
    res.json({ admins });
  } catch (error) {
    next(error);
  }
});

app.post("/api/super/admins", auth, allow("super_admin"), async (req, res, next) => {
  try {
    const organizationId = parseBodyString(req.body.organizationId);
    const name = parseBodyString(req.body.name);
    const email = parseBodyString(req.body.email).toLowerCase();
    const phone = parseBodyString(req.body.phone);
    const password = parseBodyString(req.body.password);
    if (!organizationId || !name || !email || !password) return res.status(400).json({ message: "Required fields missing" });
    if (!validateEmail(email) || (phone && !validatePhone(phone)) || password.length < 8) {
      return res.status(400).json({ message: "Invalid admin data" });
    }
    const org = await Organization.findById(organizationId);
    if (!org) return res.status(404).json({ message: "Organization not found" });
    const exists = await User.findOne({ organizationId, email });
    if (exists) return res.status(409).json({ message: "Admin already exists" });
    const admin = await User.create({
      organizationId,
      role: "org_admin",
      name,
      email,
      phone,
      passwordHash: await hashPassword(password),
    });
    await audit({ organizationId, actorUserId: req.user.sub, actorRole: req.user.role, action: "org_admin_created", meta: { email } });
    res.status(201).json({ admin });
    emitSuperUpdate();
  } catch (error) {
    next(error);
  }
});

app.get("/api/super/analytics", auth, allow("super_admin"), async (req, res, next) => {
  try {
    const organizations = await Organization.countDocuments();
    const users = await User.countDocuments();
    const queues = await QueueItem.countDocuments();
    const statusBreakdown = await QueueItem.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const logs = await AuditLog.countDocuments();
    res.json({
      totals: { organizations, users, queueItems: queues, auditLogs: logs },
      statusBreakdown,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/super/audit-logs", auth, allow("super_admin"), async (req, res, next) => {
  try {
    const organizationId = req.query.organizationId || null;
    const logs = await AuditLog.find(organizationId ? { organizationId } : {}).sort({ createdAt: -1 }).limit(200).lean();
    res.json({ logs });
  } catch (error) {
    next(error);
  }
});

app.get("/api/org/audit-logs", auth, allow("org_admin"), async (req, res, next) => {
  try {
    const organizationId = normalizeOrgId(req);
    const logs = await AuditLog.find({ organizationId }).sort({ createdAt: -1 }).limit(100).lean();
    res.json({ logs });
  } catch (error) {
    next(error);
  }
});

app.use((req, res, next) => {
  if (req.path.startsWith("/api")) return res.status(404).json({ message: "Not found" });
  next();
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

io.on("connection", (socket) => {
  const organizationId = socket.handshake.auth?.organizationId || socket.handshake.query?.organizationId || null;
  const role = socket.handshake.auth?.role || "customer";

  if (organizationId) socket.join(`org:${toId(organizationId)}`);
  if (role === "super_admin") socket.join("super-admin");
});

async function start() {
  await mongoose.connect(MONGODB_URI);
  await seedSuperAdmin();
  const defaultOrg = await ensureDefaultOrg();
  io.emit("queue:update", { organizationId: toId(defaultOrg._id) });
  server.listen(PORT);
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
