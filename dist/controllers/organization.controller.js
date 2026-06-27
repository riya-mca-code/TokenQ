"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentOrganizationController = currentOrganizationController;
exports.dashboardOverviewController = dashboardOverviewController;
const Organization_1 = require("../models/Organization");
const organization_service_1 = require("../services/organization.service");
const response_1 = require("../utils/response");
async function currentOrganizationController(req, res) {
    if (!req.organizationId)
        return (0, response_1.sendError)(res, 400, "Organization context required");
    const organization = await Organization_1.Organization.findById(req.organizationId).lean();
    if (!organization)
        return (0, response_1.sendError)(res, 404, "Organization not found");
    return (0, response_1.sendSuccess)(res, "Organization loaded", {
        organization: {
            id: String(organization._id),
            name: organization.name,
            slug: organization.slug,
            businessType: organization.businessType,
            ownerName: organization.ownerName,
            email: organization.email,
            phone: organization.phone,
            status: organization.status,
            plan: organization.plan,
            timezone: organization.timezone,
            branding: organization.branding,
            defaultWorkspace: organization.defaultWorkspace,
        },
    });
}
async function dashboardOverviewController(req, res, next) {
    try {
        if (!req.auth)
            return (0, response_1.sendError)(res, 401, "Authentication required");
        const result = await (0, organization_service_1.getDashboardOverview)(req.auth.id, req.organizationId || req.auth.organizationId);
        return (0, response_1.sendSuccess)(res, "Dashboard overview", result);
    }
    catch (error) {
        return next(error);
    }
}
