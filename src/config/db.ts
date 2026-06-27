import mongoose from "mongoose";
import { env } from "./env";

let cached = false;

export async function connectDatabase() {
  if (cached || mongoose.connection.readyState === 1) return mongoose.connection;
  await mongoose.connect(env.mongoUri);
  cached = true;
  return mongoose.connection;
}
