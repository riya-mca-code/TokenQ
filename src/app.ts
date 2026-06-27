import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { healthRoutes } from "./routes/health.routes";
import { apiRoutes } from "./routes";
import { sendError } from "./utils/response";

function getCorsOrigins() {
  if (env.corsOrigin === "*") return true;
  return env.corsOrigin.split(",").map((item) => item.trim());
}

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );
  app.use(
    cors({
      origin: getCorsOrigins(),
      credentials: true,
    })
  );
  app.use(express.json({ limit: "200kb" }));
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 600,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use("/api/health", healthRoutes);
  app.use("/api/v1/auth", authLimiter);
  app.use("/api/v1", apiRoutes);

  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) return sendError(res, 404, "Not found");
    return next();
  });

  app.use((err: Error & { status?: number }, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.headersSent) return next(err);
    const status = err.status || 500;
    const message = status === 500 ? "Internal Server Error" : err.message || "Request failed";
    return res.status(status).json({
      success: false,
      message,
    });
  });

  return app;
}
