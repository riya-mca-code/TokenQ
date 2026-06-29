import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { queueRoutes } from "./queue.routes";
import { organizationRoutes } from "./organization.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/queues", queueRoutes);
router.use("/organizations", organizationRoutes);

export { router as apiRoutes };
