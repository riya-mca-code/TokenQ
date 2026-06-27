require("dotenv").config();

const path = require("path");
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
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const STAFF_USERNAME = process.env.STAFF_USERNAME || "staff";
const STAFF_PASSWORD = process.env.STAFF_PASSWORD || "staff123";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN.split(",").map((v) => v.trim()) },
});

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN.split(",").map((v) => v.trim()), credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(express.static(__dirname));

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use("/api", apiLimiter);

const queueSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, index: true },
    status: { type: String, enum: ["waiting", "serving", "completed"], default: "waiting", index: true },
    createdAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { versionKey: false }
);

const QueueItem = mongoose.model("QueueItem", queueSchema);

const sendQueue = async (res, status = 200, message = null, token = null) => {
  const queue = await QueueItem.find().sort({ createdAt: 1 }).lean();
  res.status(status).json({ queue, ...(message ? { message } : {}), ...(token ? { token } : {}) });
};

const signToken = (user) => jwt.sign({ sub: user.username, role: user.role }, JWT_SECRET, { expiresIn: "8h" });

const authenticate = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
  next();
};

const isHash = (value) => typeof value === "string" && value.startsWith("$2");
const verifyPassword = async (input, stored) => (isHash(stored) ? bcrypt.compare(input, stored) : input === stored);

async function getNextTokenNumber() {
  const items = await QueueItem.find().select("token").lean();
  return items.reduce((max, item) => {
    const number = parseInt(String(item.token || "").slice(1), 10);
    return Number.isFinite(number) && number > max ? number : max;
  }, 0) + 1;
}

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.post("/api/auth/login", authLimiter, async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ message: "Username and password are required" });

    const users = [
      { username: ADMIN_USERNAME, password: ADMIN_PASSWORD, role: "admin" },
      { username: STAFF_USERNAME, password: STAFF_PASSWORD, role: "staff" },
    ];

    for (const user of users) {
      if (username === user.username && (await verifyPassword(password, user.password))) {
        return res.json({ token: signToken(user), role: user.role, username: user.username });
      }
    }

    return res.status(401).json({ message: "Invalid credentials" });
  } catch (error) {
    next(error);
  }
});

app.get("/api/auth/me", authenticate, (req, res) => {
  res.json({ user: req.user });
});

app.get("/api/queue", async (req, res, next) => {
  try {
    await sendQueue(res);
  } catch (error) {
    next(error);
  }
});

app.post("/api/queue", async (req, res, next) => {
  try {
    const nextNumber = await getNextTokenNumber();
    const token = `A${String(nextNumber).padStart(3, "0")}`;
    const item = await QueueItem.create({ token, status: "waiting" });
    await sendQueue(res, 201, "Token generated", item);
    io.emit("queue:update");
  } catch (error) {
    next(error);
  }
});

app.patch("/api/queue/next", authenticate, authorize("admin", "staff"), async (req, res, next) => {
  try {
    const serving = await QueueItem.findOne({ status: "serving" }).sort({ createdAt: 1 });
    if (serving) {
      serving.status = "completed";
      serving.completedAt = new Date();
      await serving.save();
    }

    const nextWaiting = await QueueItem.findOne({ status: "waiting" }).sort({ createdAt: 1 });
    if (nextWaiting) {
      nextWaiting.status = "serving";
      await nextWaiting.save();
      await sendQueue(res, 200, `Now serving ${nextWaiting.token}`);
      io.emit("queue:update");
      return;
    }

    await sendQueue(res, 200, "No waiting customers");
    io.emit("queue:update");
  } catch (error) {
    next(error);
  }
});

app.patch("/api/queue/complete", authenticate, authorize("admin", "staff"), async (req, res, next) => {
  try {
    const current = await QueueItem.findOne({ status: "serving" }).sort({ createdAt: 1 });
    if (!current) return res.status(400).json({ message: "No active serving token" });

    current.status = "completed";
    current.completedAt = new Date();
    await current.save();
    await sendQueue(res, 200, `${current.token} completed`);
    io.emit("queue:update");
  } catch (error) {
    next(error);
  }
});

app.delete("/api/queue", authenticate, authorize("admin"), async (req, res, next) => {
  try {
    await QueueItem.deleteMany({});
    await sendQueue(res, 200, "Queue reset completed");
    io.emit("queue:update");
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

async function start() {
  await mongoose.connect(MONGODB_URI);
  server.listen(PORT, () => console.log(`QueueQ running on port ${PORT}`));
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
