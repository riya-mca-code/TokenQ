import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "./env";

export type SocketContext = {
  userId?: string;
  organizationId?: string;
  role?: string;
};

let io: Server | null = null;

function getCorsOrigins() {
  if (env.corsOrigin === "*") return true;
  return env.corsOrigin.split(",").map((item) => item.trim());
}

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: getCorsOrigins(),
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) return next();

    try {
      const payload = jwt.verify(token, env.jwtSecret) as SocketContext;
      socket.data.auth = payload;
      if (payload.organizationId) {
        socket.join(`organization:${payload.organizationId}`);
      }
      if (payload.role === "SUPER_ADMIN") {
        socket.join("platform");
      }
      next();
    } catch {
      next();
    }
  });

  io.on("connection", (socket) => {
    const organizationId = socket.handshake.query.organizationId as string | undefined;
    if (organizationId) {
      socket.join(`organization:${organizationId}`);
    }
  });

  return io;
}

export function getSocketServer() {
  if (!io) {
    throw new Error("Socket server has not been initialized");
  }
  return io;
}

export function emitToOrganization(organizationId: string, event: string, payload: unknown) {
  if (!io) return;
  io.to(`organization:${organizationId}`).emit(event, payload);
}

export function emitToPlatform(event: string, payload: unknown) {
  if (!io) return;
  io.to("platform").emit(event, payload);
}
