"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const organization_1 = require("../middleware/organization");
const organization_controller_1 = require("../controllers/organization.controller");
const router = (0, express_1.Router)();
exports.organizationRoutes = router;
router.get("/current", auth_1.authRequired, organization_1.resolveOrganization, organization_controller_1.currentOrganizationController);
router.get("/dashboard/overview", auth_1.authRequired, organization_1.resolveOrganization, organization_controller_1.dashboardOverviewController);
router.get("/:organizationId", auth_1.authRequired, (0, role_1.allowRoles)("SUPER_ADMIN"), (req, res, next) => {
    req.organizationId = typeof req.params.organizationId === "string" ? req.params.organizationId : undefined;
    next();
}, organization_controller_1.currentOrganizationController);
