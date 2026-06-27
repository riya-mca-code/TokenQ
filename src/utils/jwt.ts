import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { AuthSession } from "../types/express";

export function signAuthToken(session: AuthSession) {
  return jwt.sign(
    {
      id: session.id,
      organizationId: session.organizationId,
      role: session.role,
      email: session.email,
    },
    env.jwtSecret as jwt.Secret,
    { expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"] }
  );
}

export function verifyAuthToken(token: string) {
  return jwt.verify(token, env.jwtSecret) as AuthSession;
}
