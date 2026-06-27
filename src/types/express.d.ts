import type { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthSession;
      organizationId?: string;
    }
  }
}

export interface AuthSession extends JwtPayload {
  id: string;
  organizationId: string | null;
  role: "SUPER_ADMIN" | "ADMIN" | "STAFF";
  email: string;
}

export {};
