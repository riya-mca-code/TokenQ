import mongoose from "mongoose";
import { env } from "./env";

let cached = false;

function toAtlasSeedListConnectionString(uri: string) {
  if (!uri.startsWith("mongodb+srv://")) return uri;

  const parsed = new URL(uri);
  const parts = parsed.hostname.split(".");
  if (parts.length < 3 || !parsed.hostname.endsWith(".mongodb.net")) return uri;

  const query = new URLSearchParams(parsed.search);
  query.delete("ssl");
  query.set("tls", "true");
  if (!query.has("authSource")) {
    query.set("authSource", "admin");
  }
  if (!query.has("replicaSet")) {
    query.set("replicaSet", `atlas-${parts[1]}-shard-0`);
  }

  const clusterName = parts[0];
  const domain = parts.slice(1).join(".");
  const hosts = [0, 1, 2].map((index) => `${clusterName}-shard-00-0${index}.${domain}:27017`).join(",");
  const auth = parsed.username
    ? `${encodeURIComponent(parsed.username)}${parsed.password ? `:${encodeURIComponent(parsed.password)}` : ""}@`
    : "";

  return `mongodb://${auth}${hosts}${parsed.pathname}${query.toString() ? `?${query.toString()}` : ""}`;
}

function getDevelopmentFallbackUri(uri: string) {
  const parsed = new URL(uri);
  const databaseName = parsed.pathname.replace(/^\/+/, "") || "tokenq";
  return `mongodb://127.0.0.1:27017/${databaseName}`;
}

export async function connectDatabase() {
  if (cached || mongoose.connection.readyState === 1) return mongoose.connection;

  const connectOptions = {
    serverSelectionTimeoutMS: 5000,
  };

  try {
    await mongoose.connect(toAtlasSeedListConnectionString(env.mongoUri), connectOptions);
  } catch (error) {
    if (env.nodeEnv !== "development") {
      throw error;
    }

    await mongoose.connect(getDevelopmentFallbackUri(env.mongoUri), connectOptions);
  }

  cached = true;
  return mongoose.connection;
}
