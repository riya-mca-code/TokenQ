import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import {
  clearAuthCookie,
  forgotPassword,
  getCurrentUser,
  loginUser,
  registerOrganization,
  resetPassword,
} from "../services/auth.service";
import { sendError, sendSuccess } from "../utils/response";

const AUTH_COOKIE_NAME = "tokenq_session";

function setAuthCookie(res: Response, token: string) {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: "lax",
    path: "/",
    domain: env.cookieDomain || undefined,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export async function registerController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await registerOrganization({
      businessName: req.body.businessName,
      businessType: req.body.businessType,
      ownerName: req.body.ownerName,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
      timezone: req.body.timezone,
      ip: req.ip,
      userAgent: req.get("user-agent") || "",
    });

    setAuthCookie(res, result.token);
    return sendSuccess(res, "Organization registered successfully", result, 201);
  } catch (error) {
    return next(error);
  }
}

export async function loginController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await loginUser({
      email: req.body.email,
      password: req.body.password,
      organizationSlug: req.body.organizationSlug,
      ip: req.ip,
      userAgent: req.get("user-agent") || "",
    });

    setAuthCookie(res, result.token);
    return sendSuccess(res, "Logged in successfully", result);
  } catch (error) {
    return next(error);
  }
}

export async function logoutController(req: Request, res: Response) {
  clearAuthCookie(res);
  return sendSuccess(res, "Logged out successfully", {});
}

export async function meController(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) return sendError(res, 401, "Authentication required");
    const result = await getCurrentUser(req.auth.id);
    return sendSuccess(res, "Current user", result);
  } catch (error) {
    return next(error);
  }
}

export async function forgotPasswordController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await forgotPassword({
      email: req.body.email,
      organizationSlug: req.body.organizationSlug,
      origin: `${req.protocol}://${req.get("host")}`,
    });
    return sendSuccess(res, "If the account exists, a reset link has been sent", result || {});
  } catch (error) {
    return next(error);
  }
}

export async function resetPasswordController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await resetPassword({
      token: req.body.token,
      password: req.body.password,
    });
    setAuthCookie(res, result.token);
    return sendSuccess(res, "Password reset successfully", result);
  } catch (error) {
    return next(error);
  }
}
