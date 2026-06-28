import mongoose from "mongoose";
import { promises as dns } from "dns";
import { env } from "./env";

let cached = false;

async function resolveSrvConnectionString(uri: string) {
  if (!uri.startsWith("mongodb+srv://")) return uri;

  const parsed = new URL(uri);
  const hosts = await dns.resolveSrv(`_mongodb._tcp.${parsed.hostname}`);
  if (!hosts.length) return uri;

  const resolvedHosts = hosts
    .sort((a, b) => (a.priority - b.priority) || (a.weight - b.weight))
    .map((host) => `${host.name}:${host.port}`)
    .join(",");

  const query = new URLSearchParams(parsed.search);
  query.set("tls", query.get("tls") ?? "true");

  try {
    const txtRecords = await dns.resolveTxt(parsed.hostname);
    const txtOptions = txtRecords
      .flat()
      .map((item) => item.trim())
      .find((item) => item.length > 0);

    if (txtOptions) {
      const txtParams = new URLSearchParams(txtOptions);
      for (const [key, value] of txtParams.entries()) {
        if (!query.has(key)) {
          query.set(key, value);
        }
      }
    }
  } catch {
    // Atlas TXT records are optional for connectivity.
  }

  return `mongodb://${resolvedHosts}${parsed.pathname}${query.toString() ? `?${query.toString()}` : ""}`;
}

export async function connectDatabase() {
  if (cached || mongoose.connection.readyState === 1) return mongoose.connection;

  try {
    await mongoose.connect(env.mongoUri);
  } catch (error) {
    if (env.mongoUri.startsWith("mongodb+srv://")) {
      const fallbackUri = await resolveSrvConnectionString(env.mongoUri);
      if (fallbackUri !== env.mongoUri) {
        await mongoose.connect(fallbackUri);
      } else {
        throw error;
      }
    } else {
      throw error;
    }
  }

  cached = true;
  return mongoose.connection;
}
