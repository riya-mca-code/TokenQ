import { Router } from "express";
import { authRequired } from "../middleware/auth";
import { allowRoles } from "../middleware/role";
import { resolveOrganization } from "../middleware/organization";
import { currentOrganizationController, dashboardOverviewController } from "../controllers/organization.controller";

const router = Router();

router.get("/current", authRequired, resolveOrganization, currentOrganizationController);
router.get("/dashboard/overview", authRequired, resolveOrganization, dashboardOverviewController);
router.get(
  "/:organizationId",
  authRequired,
  allowRoles("SUPER_ADMIN"),
  (req, res, next) => {
    req.organizationId = typeof req.params.organizationId === "string" ? req.params.organizationId : undefined;
    next();
  },
  currentOrganizationController
);

export { router as organizationRoutes };
