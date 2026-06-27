import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { organizationRoutes } from "./organization.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/organizations", organizationRoutes);

export { router as apiRoutes };
