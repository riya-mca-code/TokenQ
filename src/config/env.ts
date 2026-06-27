import dotenv from "dotenv";

dotenv.config();

function getEnv(name: string, fallback = "") {
  return process.env[name] ?? fallback;
}

function getBooleanEnv(name: string, fallback = false) {
  const value = process.env[name];
  if (value === undefined) return fallback;
  return value === "true" || value === "1";
}

export const env = {
  nodeEnv: getEnv("NODE_ENV", "development"),
  port: Number(getEnv("PORT", "5000")),
  mongoUri: getEnv("MONGODB_URI"),
  jwtSecret: getEnv("JWT_SECRET"),
  jwtExpiresIn: getEnv("JWT_EXPIRES_IN", "7d"),
  clientUrl: getEnv("CLIENT_URL", "http://localhost:3000"),
  corsOrigin: getEnv("CORS_ORIGIN", getEnv("CLIENT_URL", "http://localhost:3000")),
  superAdminEmail: getEnv("SUPER_ADMIN_EMAIL"),
  superAdminPassword: getEnv("SUPER_ADMIN_PASSWORD"),
  superAdminName: getEnv("SUPER_ADMIN_NAME", "Super Admin"),
  cookieDomain: getEnv("COOKIE_DOMAIN"),
  cookieSecure: getBooleanEnv("COOKIE_SECURE", getEnv("NODE_ENV", "development") === "production"),
  smtp: {
    host: getEnv("SMTP_HOST"),
    port: Number(getEnv("SMTP_PORT", "587")),
    user: getEnv("SMTP_USER"),
    pass: getEnv("SMTP_PASS"),
    from: getEnv("SMTP_FROM", "TokenQ <no-reply@tokenq.local>"),
  },
};

export function assertEnv() {
  if (!env.mongoUri) throw new Error("MONGODB_URI is required");
  if (!env.jwtSecret) throw new Error("JWT_SECRET is required");
}
